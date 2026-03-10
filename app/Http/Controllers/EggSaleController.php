<?php

namespace App\Http\Controllers;

use App\Models\EggSale;
use App\Models\EggStock;
use App\Http\Requests\StoreEggSaleRequest;
use App\Http\Requests\ApproveEggSaleRequest;
use App\Http\Requests\CancelEggSaleRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use App\Services\AccountingService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;


class EggSaleController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $sales = EggSale::with(['creator', 'approver'])
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->orderBy('sale_date', 'desc')
            ->paginate(20)
            ->through(fn($sale) => [
                'id' => $sale->id,
                'sale_date' => $sale->sale_date->format('d/m/Y'),
                'customer' => $sale->customer_name,
                'quantity' => $sale->quantity,
                'unit_price' => $sale->unit_price,
                'total' => $sale->total,
                'total_with_tax' => $sale->total_with_tax,
                'status' => $sale->status,
                'created_by' => $sale->creator->name,
                'approved_by' => $sale->approver?->name,
                'approved_at' => $sale->approved_at?->format('d/m/Y H:i'),
                'can_edit' => auth()->user()->can('update', $sale),
                'can_delete' => auth()->user()->can('delete', $sale),
                'can_approve' => auth()->user()->can('approve', $sale),
                'can_cancel' => auth()->user()->can('cancel', $sale),
            ]);

        // Récupérer le stock global pour l'afficher (optionnel)
        $globalStock = EggStock::first();

        return Inertia::render('EggSales/Index', [
            'sales' => $sales,
            'globalStock' => $globalStock?->quantity ?? 0,
            'filters' => $request->only(['status']),
        ]);
    }

    public function create()
    {
        // On peut passer le stock global pour information
        $globalStock = EggStock::first();
        return Inertia::render('EggSales/Create', [
            'globalStock' => $globalStock?->quantity ?? 0,
        ]);
    }

    public function store(StoreEggSaleRequest $request)
    {
        $data = $request->validated();

        // Vérifier le stock global
        $stock = EggStock::first();
        if ($stock->quantity < $data['quantity']) {
            throw ValidationException::withMessages([
                'quantity' => "Stock insuffisant. Disponible : {$stock->quantity} œufs."
            ]);
        }

        // Calculs
        $data['total'] = $data['quantity'] * $data['unit_price'];
        $taxRate = $data['tax_rate'] ?? 0;
        $data['tax_amount'] = $data['total'] * ($taxRate / 100);
        $data['total_with_tax'] = $data['total'] + $data['tax_amount'];
        $data['created_by'] = auth()->id();
        $data['status'] = 'draft';

        EggSale::create($data);

        return redirect()->route('egg-sales.index')->with('success', 'Vente enregistrée (brouillon).');
    }

    public function show(EggSale $eggSale)
    {
        $eggSale->load(['creator', 'approver']);
        return Inertia::render('EggSales/Show', ['sale' => $eggSale]);
    }

    public function edit(EggSale $eggSale)
    {
        $this->authorize('update', $eggSale);

        $stock = EggStock::first();
        return Inertia::render('EggSales/Edit', [
            'sale' => $eggSale,
            'globalStock' => $stock?->quantity ?? 0,
        ]);
    }

    public function update(StoreEggSaleRequest $request, EggSale $eggSale)
    {
        $this->authorize('update', $eggSale);

        $data = $request->validated();

        // Vérifier le stock (en tenant compte de l'ancienne quantité si changement)
        $stock = EggStock::first();
        $stockNeeded = $data['quantity'] - $eggSale->quantity;
        if ($stockNeeded > 0 && $stock->quantity < $stockNeeded) {
            throw ValidationException::withMessages([
                'quantity' => "Stock insuffisant pour cette modification. Disponible : {$stock->quantity} œufs."
            ]);
        }

        // Recalculs
        $data['total'] = $data['quantity'] * $data['unit_price'];
        $taxRate = $data['tax_rate'] ?? 0;
        $data['tax_amount'] = $data['total'] * ($taxRate / 100);
        $data['total_with_tax'] = $data['total'] + $data['tax_amount'];

        $eggSale->update($data);

        return redirect()->route('egg-sales.index')->with('success', 'Vente mise à jour.');
    }

    public function destroy(EggSale $eggSale)
    {
        $this->authorize('delete', $eggSale);

        $eggSale->delete();

        return redirect()->route('egg-sales.index')->with('success', 'Vente supprimée.');
    }

    public function approve(ApproveEggSaleRequest $request, EggSale $eggSale)
    {
        $this->authorize('approve', $eggSale);

        $stock = EggStock::first();
        if ($stock->quantity < $eggSale->quantity) {
            return back()->withErrors(['quantity' => 'Stock insuffisant.']);
        }

        DB::transaction(function () use ($eggSale, $stock) {
            // Décrémenter le stock
            EggStock::remove($eggSale->quantity);

            // Mettre à jour la vente
            $eggSale->status = 'approved';
            $eggSale->approved_by = auth()->id();
            $eggSale->approved_at = now();
            $eggSale->save();

            event(new \App\Events\EggSaleApproved($eggSale));
            
            
        });

        return redirect()->back()->with('success', 'Vente approuvée et écriture comptable générée.');
    }

    public function cancel(CancelEggSaleRequest $request, EggSale $eggSale)
    {
        $this->authorize('cancel', $eggSale);

        // Réintégrer le stock
        EggStock::add($eggSale->quantity);

        $eggSale->status = 'cancelled';
        $eggSale->cancellation_reason = $request->reason;
        $eggSale->save();

        return redirect()->back()->with('success', 'Vente annulée et stock restitué.');
    }

}
