<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    use AuthorizesRequests;

    public function balance(Request $request)
    {
        // Optionnel : $this->authorize('view accounting');

        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = JournalEntry::query();
        
        if ($startDate) {
            $query->whereHas('voucher', fn($q) => $q->where('date', '>=', $startDate));
        }
        if ($endDate) {
            $query->whereHas('voucher', fn($q) => $q->where('date', '<=', $endDate));
        }

        $accounts = Account::all()->map(function ($account) use ($query) {
            $debit = (clone $query)->where('account_id', $account->id)->sum('debit');
            $credit = (clone $query)->where('account_id', $account->id)->sum('credit');
            
            $balance = $debit - $credit;
            
            // Calcul des soldes débiteurs/créditeurs selon la nature du compte
            if (in_array($account->type, ['asset', 'expense'])) {
                $solde_debiteur = $balance > 0 ? $balance : 0;
                $solde_crediteur = $balance < 0 ? abs($balance) : 0;
            } else {
                // liability, equity, revenue
                $solde_crediteur = $balance < 0 ? abs($balance) : 0;
                $solde_debiteur = $balance > 0 ? $balance : 0;
            }

            return [
                'code' => $account->code,
                'name' => $account->name,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $balance,
                'solde_debiteur' => $solde_debiteur,
                'solde_crediteur' => $solde_crediteur,
            ];
        });

        $totalDebit = $accounts->sum('debit');
        $totalCredit = $accounts->sum('credit');

        return Inertia::render('Reports/Balance', [
            'accounts' => $accounts,
            'totalDebit' => $totalDebit,
            'totalCredit' => $totalCredit,
            'filters' => ['start_date' => $startDate, 'end_date' => $endDate],
        ]);
    }

    public function downloadBalancePdf(Request $request)
    {
        // Optionnel : $this->authorize('view accounting');
        
        $accounts = Account::withSum('journalEntries as debit', 'debit')
            ->withSum('journalEntries as credit', 'credit')
            ->get()
            ->map(function ($account) {
                $balance = ($account->debit ?? 0) - ($account->credit ?? 0);
                
                if (in_array($account->type, ['asset', 'expense'])) {
                    $account->solde_debiteur = $balance > 0 ? $balance : 0;
                    $account->solde_crediteur = $balance < 0 ? abs($balance) : 0;
                } else {
                    $account->solde_crediteur = $balance < 0 ? abs($balance) : 0;
                    $account->solde_debiteur = $balance > 0 ? $balance : 0;
                }
                return $account;
            });

        $totalDebit = $accounts->sum('debit');
        $totalCredit = $accounts->sum('credit');

        $pdf = Pdf::loadView('pdfs.balance', compact('accounts', 'totalDebit', 'totalCredit'));
        
        return $pdf->download('Balance_Generale_' . date('Y_m_d') . '.pdf');
    }
}