<?php

namespace App\Listeners;

use App\Events\EggSaleApproved;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\JournalVoucher;
use App\Models\JournalEntry;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

class CreateJournalEntryForEggSaleApproved
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
    public function handle(EggSaleApproved $event): void
    {
       $eggSale = $event->eggSale;

        // Comptes
        $revenueAccount = Account::where('code', '701')->first();   // Ventes d'œufs
        $cashAccount = Account::where('code', '512')->first();      // Banque
        $vatAccount = Account::where('code', '4457')->first();      // TVA collectée

        if (!$revenueAccount || !$cashAccount) {
            // Gérer l'absence des comptes (log d'erreur)
            return;
        }

        DB::transaction(function () use ($eggSale, $revenueAccount, $cashAccount, $vatAccount) {
            $voucherNumber = JournalVoucher::generateVoucherNumber();

            $voucher = JournalVoucher::create([
                'voucher_number' => $voucherNumber,
                'date' => $eggSale->sale_date,
                'description' => 'Vente d\'œufs à ' . ($eggSale->customer_name ?? 'client'),
                'source_id' => $eggSale->id,
                'source_type' => EggSale::class,
                'created_by' => $eggSale->approved_by,
            ]);

            // Écriture : Débit Banque (TTC), Crédit Ventes (HT), Crédit TVA (si applicable)
            $totalTTC = $eggSale->total_with_tax;
            $totalHT = $eggSale->total;
            $vatAmount = $eggSale->tax_amount;

            // Débit banque (TTC)
            JournalEntry::create([
                'journal_voucher_id' => $voucher->id,
                'account_id' => $cashAccount->id,
                'debit' => $totalTTC,
                'credit' => 0,
                'description' => 'Encaissement vente d\'œufs',
            ]);

            // Crédit compte de vente (HT)
            JournalEntry::create([
                'journal_voucher_id' => $voucher->id,
                'account_id' => $revenueAccount->id,
                'debit' => 0,
                'credit' => $totalHT,
                'description' => 'Ventes d\'œufs',
            ]);

            // Si TVA, crédit compte TVA
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
