<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AccountController extends Controller
{
    use AuthorizesRequests;   
    public function __construct()
    {
        
    }

    public function index()
    {
        $accounts = Account::all()->map(function ($account) {
            $debit = JournalEntry::where('account_id', $account->id)->sum('debit');
            $credit = JournalEntry::where('account_id', $account->id)->sum('credit');
            $balance = $debit - $credit;
            return [
                'id' => $account->id,
                'code' => $account->code,
                'name' => $account->name,
                'type' => $account->type,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $balance,
            ];
        });

        return Inertia::render('Accounts/Index', ['accounts' => $accounts]);
    }

    public function show(Account $account)
    {
        // Détail des mouvements du compte
        $entries = JournalEntry::where('account_id', $account->id)
            ->with('voucher')
            ->orderBy('voucher.date')
            ->get()
            ->map(fn($entry) => [
                'date' => $entry->voucher->date->format('d/m/Y'),
                'voucher' => $entry->voucher->voucher_number,
                'description' => $entry->description ?? $entry->voucher->description,
                'debit' => $entry->debit,
                'credit' => $entry->credit,
            ]);

        return Inertia::render('Accounts/Show', [
            'account' => $account,
            'entries' => $entries,
        ]);
    }
}
