<?php

namespace App\Listeners;

use App\Events\FlockEnded;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CreateJournalEntryForFlockEnd
{
    public function handle(FlockEnded $event)
    {
        $flock = $event->flock;

        // Si c'est une vente (sale_price renseigné)
        if ($flock->sale_price && $flock->sale_price > 0) {
            $this->createSaleEntry($flock);
        }
        // Si c'est une mortalité ou autre, on peut ne rien faire, ou enregistrer une perte
        // (optionnel)
    }

    private function createSaleEntry($flock)
    {
        $revenueAccount = Account::where('code', '702')->first(); // Ventes de poules (à créer)
        $cashAccount = Account::where('code', '512')->first();    // Banque
        $vatAccount = Account::where('code', '4457')->first();    // TVA collectée

        if (!$revenueAccount || !$cashAccount) {
            return;
        }

        // On suppose que le prix est TTC. Si HT, adapter.
        $totalTTC = $flock->sale_price;
        // Si on a un taux de TVA, on pourrait le stocker. Pour simplifier, on prend HT = TTC.
        $totalHT = $totalTTC;
        $vatAmount = 0;

        DB::transaction(function () use ($flock, $revenueAccount, $cashAccount, $vatAccount, $totalTTC, $totalHT, $vatAmount) {
            $voucherNumber = JournalVoucher::generateVoucherNumber();

            $voucher = JournalVoucher::create([
                'voucher_number' => $voucherNumber,
                'date' => $flock->sale_date ?? now(),
                'description' => 'Vente de poules - Lot ' . $flock->name . ' à ' . ($flock->sale_customer ?? 'client'),
                'source_id' => $flock->id,
                'source_type' => Flock::class,
                'created_by' => auth()->id(), // ou celui qui a terminé le lot
            ]);

            // Débit banque (TTC)
            JournalEntry::create([
                'journal_voucher_id' => $voucher->id,
                'account_id' => $cashAccount->id,
                'debit' => $totalTTC,
                'credit' => 0,
                'description' => 'Encaissement vente poules',
            ]);

            // Crédit vente (HT)
            JournalEntry::create([
                'journal_voucher_id' => $voucher->id,
                'account_id' => $revenueAccount->id,
                'debit' => 0,
                'credit' => $totalHT,
                'description' => 'Ventes de poules',
            ]);

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
