<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ReportController extends Controller
{
    use AuthorizesRequests;
    public function balance(Request $request)
    {
        $this->authorize('view accounting');

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
            return [
                'code' => $account->code,
                'name' => $account->name,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $debit - $credit,
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
}
