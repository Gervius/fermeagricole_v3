<?php

namespace App\Http\Controllers;

use App\Models\JournalVoucher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class JournalVoucherController extends Controller
{
    use AuthorizesRequests;
    public function __construct()
    {
        
    }

    public function index(Request $request)
    {
        $vouchers = JournalVoucher::with('creator')
            ->orderBy('date', 'desc')
            ->paginate(20)
            ->through(fn($v) => [
                'id' => $v->id,
                'voucher_number' => $v->voucher_number,
                'date' => $v->date->format('d/m/Y'),
                'description' => $v->description,
                'created_by' => $v->creator->name,
                'entries_count' => $v->entries()->count(),
            ]);

        return Inertia::render('JournalVouchers/Index', ['vouchers' => $vouchers]);
    }

    public function show(JournalVoucher $journalVoucher)
    {
        $journalVoucher->load('creator', 'entries.account');
        return Inertia::render('JournalVouchers/Show', ['voucher' => $journalVoucher]);
    }
}
