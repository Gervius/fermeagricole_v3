<?php

namespace App\Listeners;

use App\Events\TreatmentCompleted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CreateJournalEntryForTreatmentApproved
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
    public function handle(TreatmentCompleted $event): void
    {
        $treatment = $event->treatment;

        if (!$treatment->cost || $treatment->cost <= 0) {
            return;
        }

        $expenseAccount = Account::where('code', '602')->first(); // Soins vétérinaires
        $supplierAccount = Account::where('code', '401')->first(); // Fournisseurs
        $cashAccount = Account::where('code', '512')->first(); // Banque

        if (!$expenseAccount || !$supplierAccount || !$cashAccount) {
            return;
        }

        DB::transaction(function () use ($treatment, $expenseAccount, $supplierAccount, $cashAccount) {
            $voucherNumber = JournalVoucher::generateVoucherNumber();

            $description = 'Traitement vétérinaire : ' . ($treatment->description ?? '');
            if ($treatment->payment_date) {
                $description .= ' (payé le ' . $treatment->payment_date->format('d/m/Y') . ')';
            }

            $voucher = JournalVoucher::create([
                'voucher_number' => $voucherNumber,
                'date' => $treatment->treatment_date, // date de l'acte
                'description' => $description,
                'source_id' => $treatment->id,
                'source_type' => Treatment::class,
                'created_by' => $treatment->approved_by,
            ]);

            // Débit compte de charge
            JournalEntry::create([
                'journal_voucher_id' => $voucher->id,
                'account_id' => $expenseAccount->id,
                'debit' => $treatment->cost,
                'credit' => 0,
                'description' => 'Soins vétérinaires',
            ]);

            if ($treatment->payment_date) {
                // Si payé immédiatement, crédit banque
                JournalEntry::create([
                    'journal_voucher_id' => $voucher->id,
                    'account_id' => $cashAccount->id,
                    'debit' => 0,
                    'credit' => $treatment->cost,
                    'description' => 'Règlement soins vétérinaires',
                ]);
            } else {
                // Si non payé, crédit fournisseur
                JournalEntry::create([
                    'journal_voucher_id' => $voucher->id,
                    'account_id' => $supplierAccount->id,
                    'debit' => 0,
                    'credit' => $treatment->cost,
                    'description' => 'Dette fournisseur pour soins vétérinaires',
                ]);
            }
        });
    }
}
