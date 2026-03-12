<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalVoucher;
use App\Models\JournalEntry;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\EggMovement;
use App\Models\Flock;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    /**
     * Génère les écritures comptables pour une facture approuvée.
     */
    public function createForInvoice(Invoice $invoice)
    {
        // Récupérer les comptes
        $clientAccount = Account::where('code', 'like', '411%')->first()
            ?? Account::firstOrCreate(['code' => '411100'], ['name' => 'Clients', 'type' => 'asset']);
        $salesAccount = Account::where('code', 'like', '701%')->first()
            ?? Account::firstOrCreate(['code' => '701000'], ['name' => 'Ventes de produits', 'type' => 'revenue']);

        // Créer le voucher (brouillon)
        $voucher = JournalVoucher::create([
            'voucher_number' => null,
            'status' => 'draft',
            'date' => $invoice->date,
            'description' => "Vente - Facture n° " . $invoice->number,
            'source_id' => $invoice->id,
            'source_type' => Invoice::class,
            'created_by' => $invoice->approved_by ?? auth()->id(),
        ]);

        // Débit client
        $voucher->entries()->create([
            'account_id' => $clientAccount->id,
            'debit' => $invoice->total,
            'credit' => 0,
            'description' => "Créance Client - " . $invoice->customer_name,
        ]);

        // Crédit vente
        $voucher->entries()->create([
            'account_id' => $salesAccount->id,
            'debit' => 0,
            'credit' => $invoice->total,
            'description' => "Vente - Facture n° " . $invoice->number,
        ]);

        // Gérer les mouvements de stock pour les articles
        foreach ($invoice->items as $item) {
            if ($item->itemable_type === EggMovement::class) {
                // Vente d'oeufs
                EggMovement::create([
                    'date' => $invoice->date,
                    'type' => 'out',
                    'quantity' => $item->quantity, // toujours positif, le type indique la sortie
                    'source_id' => $item->id,
                    'source_type' => get_class($item),
                    'created_by' => $invoice->approved_by ?? auth()->id(),
                    'notes' => "Vente d'oeufs - Facture {$invoice->number}",
                ]);
            } elseif ($item->itemable_type === Flock::class) {
                // Vente de poules
                $flock = Flock::find($item->itemable_id);
                if ($flock) {
                    // Vérifier si le lot est terminé
                    if ($flock->calculated_quantity <= 0) {
                        $flock->status = 'completed';
                        $flock->ended_at = now();
                        $flock->end_reason = 'sale';
                        $flock->save();
                    }

                    // Optionnel : allocation analytique
                    if (class_exists(\App\Models\AnalyticalAccount::class)) {
                        $analyticalAcc = \App\Models\AnalyticalAccount::firstOrCreate(
                            ['target_id' => $flock->id, 'target_type' => Flock::class],
                            ['code' => 'LOT-' . $flock->id, 'name' => 'Suivi Lot ' . $flock->name]
                        );

                        \App\Models\AnalyticalAllocation::create([
                            'journal_entry_id' => $voucher->entries->last()->id,
                            'analytical_account_id' => $analyticalAcc->id,
                            'amount' => $item->total,
                            'percentage' => 100,
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Génère l'écriture comptable pour un paiement.
     */
    public function createForPayment(Payment $payment)
    {
        $invoice = $payment->invoice;

        // Comptes (à adapter selon votre plan comptable)
        $cashAccount = Account::where('code', 'like', '571%')->orWhere('code', 'like', '581%')->first();
        $clientAccount = Account::where('code', 'like', '411%')->first();

        if (!$cashAccount || !$clientAccount) {
            throw new \Exception("Comptes de trésorerie ou client non configurés.");
        }

        $voucher = JournalVoucher::create([
            'voucher_number' => JournalVoucher::generateVoucherNumber(),
            'date' => $payment->payment_date,
            'description' => "Paiement facture {$invoice->number} - {$payment->method}",
            'source_id' => $payment->id,
            'source_type' => Payment::class,
            'created_by' => $payment->created_by,
            'status' => 'draft', // ou 'posted' si vous voulez directement valider
        ]);

        // Débit trésorerie
        $voucher->entries()->create([
            'account_id' => $cashAccount->id,
            'debit' => $payment->amount,
            'credit' => 0,
            'description' => "Encaissement via {$payment->method}",
        ]);

        // Crédit client
        $voucher->entries()->create([
            'account_id' => $clientAccount->id,
            'debit' => 0,
            'credit' => $payment->amount,
            'description' => "Règlement facture {$invoice->number}",
        ]);
    }

    /**
     * Annule les effets d'une facture (à appeler lors du passage à cancelled).
     */
    public function cancelInvoice(Invoice $invoice)
    {
        // Trouver le voucher associé (s'il existe)
        $voucher = JournalVoucher::where('source_id', $invoice->id)
            ->where('source_type', Invoice::class)
            ->first();

        if ($voucher) {
            // Option 1 : Marquer le voucher comme annulé
            $voucher->update(['status' => 'cancelled']); // à ajouter dans la migration si besoin

            // Option 2 : Créer des écritures inverses
            // ...
        }

        // Inverser les mouvements de stock
        foreach ($invoice->items as $item) {
            if ($item->itemable_type === EggMovement::class) {
                // Créer un mouvement d'entrée pour compenser la sortie
                EggMovement::create([
                    'date' => now(),
                    'type' => 'in', // ou 'adjust' selon votre logique
                    'quantity' => $item->quantity,
                    'source_id' => $item->id,
                    'source_type' => get_class($item),
                    'created_by' => auth()->id(),
                    'notes' => "Annulation facture {$invoice->number}",
                ]);
            } elseif ($item->itemable_type === Flock::class) {
                $flock = Flock::find($item->itemable_id);
                if ($flock && $flock->status === 'completed' && $flock->end_reason === 'sale') {
                    // Remettre le lot en actif ? Cela dépend de votre logique.
                    // Peut-être simplement recalculer la quantité.
                }
            }
        }
    }
}