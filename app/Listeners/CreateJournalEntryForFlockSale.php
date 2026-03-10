<?php

namespace App\Listeners;

use App\Events\FlockEnded;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CreateJournalEntryForFlockSale
{
    public function handle(FlockEnded $event)
    {
        $flock = $event->flock;

        // Ne traiter que les ventes
        if ($flock->end_reason !== 'sale' || !$flock->sale_price || $flock->sale_price <= 0) {
            return;
        }

        // Comptes nécessaires
        $revenueAccount = Account::where('code', '702')->first(); // Ventes de poules (à créer)
        $clientAccount = Account::where('code', '411')->first();  // Clients
        $bankAccount = Account::where('code', '512')->first();    // Banque
        $vatAccount = Account::where('code', '4457')->first();    // TVA collectée

        if (!$revenueAccount || !$clientAccount || !$bankAccount) {
            // Log d'erreur : comptes manquants
            return;
        }

        // Déterminer si la vente est au comptant ou à crédit
        // Pour simplifier, on suppose que le champ sale_date est la date de vente,
        // et on considère que si sale_invoice_ref est rempli, c'est peut-être à crédit.
        // Mais on peut ajouter un champ 'sale_payment_type' (cash/credit). Pour l'instant, on suppose au comptant.
        $isCash = true; // à adapter selon vos besoins

        DB::transaction(function () use ($flock, $revenueAccount, $clientAccount, $bankAccount, $vatAccount, $isCash) {
            $voucherNumber = JournalVoucher::generateVoucherNumber();

            $voucher = JournalVoucher::create([
                'voucher_number' => $voucherNumber,
                'date' => $flock->sale_date ?? $flock->ended_at,
                'description' => 'Vente de poules - Lot ' . $flock->name . ($flock->sale_customer ? ' à ' . $flock->sale_customer : ''),
                'source_id' => $flock->id,
                'source_type' => Flock::class,
                'created_by' => auth()->id() ?: $flock->created_by,
            ]);

            // Montant TTC (on suppose que sale_price est TTC)
            $totalTTC = $flock->sale_price;
            // Si vous avez un taux de TVA, vous pouvez le stocker dans le lot ou le déduire.
            // Pour cet exemple, on prend HT = TTC (pas de TVA).
            $totalHT = $totalTTC;
            $vatAmount = 0;

            // Ligne débit : soit banque, soit client
            if ($isCash) {
                JournalEntry::create([
                    'journal_voucher_id' => $voucher->id,
                    'account_id' => $bankAccount->id,
                    'debit' => $totalTTC,
                    'credit' => 0,
                    'description' => 'Encaissement vente poules',
                ]);
            } else {
                JournalEntry::create([
                    'journal_voucher_id' => $voucher->id,
                    'account_id' => $clientAccount->id,
                    'debit' => $totalTTC,
                    'credit' => 0,
                    'description' => 'Créance client vente poules',
                ]);
            }

            // Ligne crédit : compte de vente (HT)
            JournalEntry::create([
                'journal_voucher_id' => $voucher->id,
                'account_id' => $revenueAccount->id,
                'debit' => 0,
                'credit' => $totalHT,
                'description' => 'Ventes de poules',
            ]);

            // Si TVA, ajouter une ligne
            if ($vatAmount > 0 && $vatAccount) {
                JournalEntry::create([
                    'journal_voucher_id' => $voucher->id,
                    'account_id' => $vatAccount->id,
                    'debit' => 0,
                    'credit' => $vatAmount,
                    'description' => 'TVA collectée',
                ]);
            }
        });
    }
}
