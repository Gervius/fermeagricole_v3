<?php

namespace App\Listeners;

use App\Events\FlockApproved;
use App\Models\JournalVoucher;
use App\Models\JournalEntry;
use App\Models\Account;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CreateJournalEntryFoFlockApproval
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    public function handle(FlockApproved $event)
    {
        $flock = $event->flock;

        // Si aucun coût d'achat n'est renseigné, on ne fait rien
        if (!$flock->purchase_cost || $flock->purchase_cost <= 0) {
            return;
        }

        // Déterminer les comptes (à adapter selon votre plan comptable)
        $expenseAccount = Account::where('code', '604')->first(); // Achats de poules (à créer)
        $cashAccount = Account::where('code', '512')->first();    // Banque (ou fournisseur)

        if (!$expenseAccount || !$cashAccount) {
            // Log ou gestion d'erreur
            return;
        }

        DB::transaction(function () use ($flock, $expenseAccount, $cashAccount) {
            // Créer le voucher
            $voucher = JournalVoucher::create([
                'voucher_number' => $this->generateVoucherNumber(),
                'date' => $flock->approved_at ?? now(),
                'description' => 'Achat de poules - Lot ' . $flock->name,
                'source_id' => $flock->id,
                'source_type' => Flock::class,
                'created_by' => $flock->approved_by ?? $flock->created_by,
            ]);

            // Ligne débit : compte d'achat
            JournalEntry::create([
                'journal_voucher_id' => $voucher->id,
                'account_id' => $expenseAccount->id,
                'debit' => $flock->purchase_cost,
                'credit' => 0,
                'description' => 'Achat de poules',
            ]);

            // Ligne crédit : compte banque (ou fournisseur)
            JournalEntry::create([
                'journal_voucher_id' => $voucher->id,
                'account_id' => $cashAccount->id,
                'debit' => 0,
                'credit' => $flock->purchase_cost,
                'description' => 'Règlement achat poules',
            ]);
        });
    }

    private function generateVoucherNumber()
    {
        $year = date('Y');
        $month = date('m');
        $last = JournalVoucher::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();
        $next = $last ? intval(substr($last->voucher_number, -4)) + 1 : 1;
        return 'VT-' . $year . $month . '-' . str_pad($next, 4, '0', STR_PAD_LEFT);
    }
}
