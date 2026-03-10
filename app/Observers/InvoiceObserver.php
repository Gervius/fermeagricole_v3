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
            
            // 1. Générer l'écriture comptable
            $voucher = JournalVoucher::create([
                'voucher_number' => JournalVoucher::generateVoucherNumber(),
                'date' => $invoice->date,
                'description' => "Vente - Facture n° " . $invoice->number,
                'source_id' => $invoice->id,
                'source_type' => Invoice::class,
                'created_by' => $invoice->approved_by,
            ]);

            // Ici, tu ajouteras la logique pour créer les JournalEntries (Débit Client / Crédit Vente)

            // 2. Gérer les sorties de stock d'œufs
            foreach ($invoice->items as $item) {
                if ($item->itemable_type === 'Egg') { // Si c'est une vente d'oeufs
                    EggMovement::create([
                        'date' => $invoice->date,
                        'type' => 'out',
                        'quantity' => -abs($item->quantity), // Toujours négatif pour une sortie
                        'source_id' => $item->id,
                        'source_type' => get_class($item),
                        'created_by' => $invoice->approved_by,
                    ]);
                }
            }
        }
    }
}
