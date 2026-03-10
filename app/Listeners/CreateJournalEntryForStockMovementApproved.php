<?php

namespace App\Listeners;

use App\Events\StockMovementApproved;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CreateJournalEntryForStockMovementApproved
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(StockMovementApproved $event): void
    {
        
        $movement = $event->stockMovement;

        // On ne traite que les mouvements de type 'in' (achat) pour l'instant
        if ($movement->type !== 'in') {
            return;
        }

        // Comptes
        $expenseAccount = Account::where('code', '601')->first();   // Achats d'aliments
        $cashAccount = Account::where('code', '512')->first();      // Banque
        $vatAccount = Account::where('code', '4456')->first();      // TVA déductible (si achat TTC)

        if (!$expenseAccount || !$cashAccount) {
            return;
        }

        // Calcul du total HT (on suppose que le prix unitaire est HT)
        $totalHT = $movement->quantity * $movement->unit_price;

        DB::transaction(function () use ($movement, $expenseAccount, $cashAccount, $vatAccount, $totalHT) {
            $voucherNumber = JournalVoucher::generateVoucherNumber();

            $voucher = JournalVoucher::create([
                'voucher_number' => $voucherNumber,
                'date' => $movement->created_at->toDateString(),
                'description' => $movement->reason ?? 'Achat de ' . $movement->ingredient->name,
                'source_id' => $movement->id,
                'source_type' => StockMovement::class,
                'created_by' => $movement->approved_by,
            ]);

            // Débit compte d'achat (HT)
            JournalEntry::create([
                'journal_voucher_id' => $voucher->id,
                'account_id' => $expenseAccount->id,
                'debit' => $totalHT,
                'credit' => 0,
                'description' => 'Achat de ' . $movement->ingredient->name,
            ]);

            // Si TVA déductible (à définir selon les taux)
            // Par exemple si le mouvement inclut la TVA, on peut avoir un champ tax_amount.
            // Pour simplifier, on suppose que le prix est HT et qu'il n'y a pas de TVA.
            // Sinon, on ajouterait une ligne débit TVA.

            // Crédit banque (montant TTC)
            // Si on n'a pas de TVA, le TTC = totalHT
            $totalTTC = $totalHT; // à ajuster si TVA

            JournalEntry::create([
                'journal_voucher_id' => $voucher->id,
                'account_id' => $cashAccount->id,
                'debit' => 0,
                'credit' => $totalTTC,
                'description' => 'Règlement achat',
            ]);
        });
    }
}
