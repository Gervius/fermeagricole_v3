<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalVoucher;
use App\Models\JournalEntry;
use App\Models\CostAllocation;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    /**
     * Enregistre une pièce comptable avec ses lignes.
     *
     * @param string $voucherNumber
     * @param \DateTime $date
     * @param string $description
     * @param array $entries tableau de ['account_code' => string, 'type' => 'debit'|'credit', 'amount' => float, 'description' => string, 'allocations' => []]
     * @return JournalVoucher
     */
    public function createVoucher($voucherNumber, $date, $description, array $entries)
    {
        return DB::transaction(function () use ($voucherNumber, $date, $description, $entries) {
            $total = array_sum(array_column($entries, 'amount'));
            
            $voucher = JournalVoucher::create([
                'voucher_number' => $voucherNumber,
                'date' => $date,
                'description' => $description,
                'total' => $total,
            ]);

            foreach ($entries as $entry) {
                $account = Account::where('code', $entry['account_code'])->firstOrFail();
                
                $journalEntry = JournalEntry::create([
                    'voucher_id' => $voucher->id,
                    'account_id' => $account->id,
                    'type' => $entry['type'],
                    'amount' => $entry['amount'],
                    'description' => $entry['description'] ?? null,
                ]);

                // Si des allocations analytiques sont fournies
                if (isset($entry['allocations'])) {
                    foreach ($entry['allocations'] as $alloc) {
                        CostAllocation::create([
                            'journal_entry_id' => $journalEntry->id,
                            'allocable_type' => $alloc['allocable_type'],
                            'allocable_id' => $alloc['allocable_id'],
                            'amount' => $alloc['amount'],
                        ]);
                    }
                }
            }

            return $voucher;
        });
    }

    // Génération d'un numéro de pièce unique
    public function generateVoucherNumber()
    {
        return 'EC-' . date('Ymd') . '-' . str_pad(JournalVoucher::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
    }
}
