<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Flock;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index()
    {
        return Inertia::render('Invoices/Index', [
            'invoices' => Invoice::with(['creator'])->latest()->paginate(10)
        ]);
    }

    public function create(Request $request)
    {
        // On récupère les données si on vient du module "Flock"
        $preFilledFlock = null;
        if ($request->has('flock_id')) {
            $flock = Flock::findOrFail($request->flock_id);
            $preFilledFlock = [
                'id' => $flock->id,
                'name' => "Liquidation du lot : " . $flock->name,
                'quantity' => $flock->current_quantity,
                'type' => Flock::class
            ];
        }

        return Inertia::render('Invoices/Create', [
            'preFilledFlock' => $preFilledFlock,
            'flocks' => Flock::active()->get(['id', 'name', 'current_quantity']),
            'nextInvoiceNumber' => 'FAC-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 4, '0', STR_PAD_LEFT)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $invoice = Invoice::create([
                'number' => $request->number,
                'customer_name' => $validated['customer_name'],
                'date' => $validated['date'],
                'subtotal' => collect($validated['items'])->sum(fn($i) => $i['quantity'] * $i['unit_price']),
                'total' => collect($validated['items'])->sum(fn($i) => $i['quantity'] * $i['unit_price']), // Simplifié sans taxes ici
                'status' => 'draft',
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                    'itemable_id' => $item['itemable_id'] ?? null,
                    'itemable_type' => $item['itemable_type'] ?? null,
                ]);
            }

            return redirect()->route('invoices.index')->with('success', 'Facture créée avec succès.');
        });
    }
}