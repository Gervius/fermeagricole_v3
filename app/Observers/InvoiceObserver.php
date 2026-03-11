<?php

namespace App\Observers;

use App\Models\Invoice;
use App\Models\JournalVoucher;
use App\Models\EggMovement;

class InvoiceObserver
{
    public function updated(Invoice $invoice): void
    {
        // On ne déclenche l'action que si le statut passe à 'approved'
        if ($invoice->wasChanged('status') && $invoice->status === 'approved') {
            
            // 1. Générer l'écriture comptable en DRAFT
            // On ne génère pas le voucher_number tout de suite, il sera généré au moment de poster
            $voucher = JournalVoucher::create([
                'voucher_number' => null,
                'status' => 'draft',
                'date' => $invoice->date,
                'description' => "Vente - Facture n° " . $invoice->number,
                'source_id' => $invoice->id,
                'source_type' => Invoice::class,
                'created_by' => $invoice->approved_by ?? auth()->id(),
            ]);

            // Récupérer des comptes par défaut pour l'exemple (à configurer selon le plan comptable)
            $clientAccount = \App\Models\Account::where('code', 'like', '411%')->first() 
                ?? \App\Models\Account::firstOrCreate(['code' => '411100', 'name' => 'Clients', 'type' => 'asset']);
            $salesAccount = \App\Models\Account::where('code', 'like', '701%')->first()
                ?? \App\Models\Account::firstOrCreate(['code' => '701000', 'name' => 'Ventes de produits finis', 'type' => 'revenue']);

            // 2. Créer les JournalEntries (Débit Client / Crédit Vente)
            $voucher->entries()->create([
                'account_id' => $clientAccount->id,
                'debit' => $invoice->total,
                'credit' => 0,
                'description' => "Créance Client - " . $invoice->customer_name,
            ]);

            $voucher->entries()->create([
                'account_id' => $salesAccount->id,
                'debit' => 0,
                'credit' => $invoice->total,
                'description' => "Vente - Facture n° " . $invoice->number,
            ]);

            // 3. Gérer les sorties de stock selon le type d'item
            foreach ($invoice->items as $item) {
                if ($item->itemable_type === 'Egg' || $item->itemable_type === 'App\\Models\\EggMovement') { 
                    // Si c'est une vente d'oeufs
                    EggMovement::create([
                        'date' => $invoice->date,
                        'type' => 'out',
                        'quantity' => -abs($item->quantity), // Toujours négatif pour une sortie
                        'source_id' => $item->id,
                        'source_type' => get_class($item),
                        'created_by' => $invoice->approved_by ?? auth()->id(),
                    ]);
                } elseif ($item->itemable_type === 'App\\Models\\Flock') {
                    // Si c'est une vente de poules (réforme)
                    $flock = \App\Models\Flock::find($item->itemable_id);
                    if ($flock) {
                        // Le stock dynamique "calculated_quantity" s'appuie sur les invoiceItems directement !
                        // Il suffit de vérifier si l'effectif actuel atteint 0 pour "terminer" le lot.
                        // cf. getCalculatedQuantityAttribute dans le modèle Flock.
                        if ($flock->calculated_quantity <= 0) {
                            $flock->status = 'completed';
                            $flock->ended_at = now();
                            $flock->end_reason = 'sale';
                            $flock->save();
                        }
                        
                        // Optionnel : Générer l'AnalyticalAllocation pour ce lot
                        if (class_exists(\App\Models\AnalyticalAccount::class)) {
                            $analyticalAcc = \App\Models\AnalyticalAccount::firstOrCreate(
                                ['code' => 'LOT-' . $flock->id],
                                ['name' => 'Suivi Lot ' . $flock->name]
                            );

                            \App\Models\AnalyticalAllocation::create([
                                'journal_entry_id' => $voucher->entries->last()->id, // On lie au crédit vente
                                'analytical_account_id' => $analyticalAcc->id,
                                'amount' => $item->total,
                                'percentage' => 100,
                            ]);
                        }
                    }
                }
            }
        }
    }
}
