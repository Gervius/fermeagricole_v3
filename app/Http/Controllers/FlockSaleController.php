<?php

namespace App\Http\Controllers;

use App\Models\FlockSale;
use App\Models\Flock;
use App\Http\Requests\StoreFlockSaleRequest;
use App\Http\Requests\ApproveFlockSaleRequest;
use App\Http\Requests\RejectFlockSaleRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class FlockSaleController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $query = FlockSale::with(['flock', 'creator', 'approver'])
            ->when($request->flock_id, fn($q, $id) => $q->where('flock_id', $id))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->orderBy('sale_date', 'desc');

        $sales = $query->paginate(20)->through(fn($sale) => [
            'id' => $sale->id,
            'sale_date' => $sale->sale_date->format('d/m/Y'),
            'flock' => $sale->flock->name,
            'quantity' => $sale->quantity,
            'unit_price' => $sale->unit_price,
            'total' => $sale->total,
            'buyer_name' => $sale->buyer_name,
            'status' => $sale->status,
            'created_by' => $sale->creator->name,
            'can_edit' => auth()->user()->can('update', $sale),
            'can_delete' => auth()->user()->can('delete', $sale),
            'can_approve' => auth()->user()->can('approve', $sale),
            'can_reject' => auth()->user()->can('reject', $sale),
        ]);

        $flocks = Flock::all(['id', 'name']);

        return Inertia::render('FlockSales/Index', [
            'sales' => $sales,
            'flocks' => $flocks,
            'filters' => $request->only(['flock_id', 'status']),
        ]);
    }

    public function create()
    {
        $flocks = Flock::active()->get(['id', 'name']); // seulement les lots actifs
        return Inertia::render('FlockSales/Create', ['flocks' => $flocks]);
    }

    public function store(StoreFlockSaleRequest $request)
    {
        $data = $request->validated();
        $flock = Flock::findOrFail($data['flock_id']);

        // Vérifier que la vente est possible
        if (!$flock->canSell($data['quantity'])) {
            return back()->withErrors(['quantity' => 'Quantité insuffisante dans le lot.'])->withInput();
        }

        $data['total'] = $data['quantity'] * $data['unit_price'];
        $data['created_by'] = auth()->id();
        $data['status'] = 'pending';

        FlockSale::create($data);

        return redirect()->route('flock-sales.index')->with('success', 'Vente enregistrée et en attente d\'approbation.');
    }

    public function show(FlockSale $flockSale)
    {
        $flockSale->load(['flock', 'creator', 'approver']);
        return Inertia::render('FlockSales/Show', ['sale' => $flockSale]);
    }

    public function edit(FlockSale $flockSale)
    {
        $this->authorize('update', $flockSale);

        $flocks = Flock::active()->get(['id', 'name']);
        return Inertia::render('FlockSales/Edit', [
            'sale' => $flockSale,
            'flocks' => $flocks,
        ]);
    }

    public function update(StoreFlockSaleRequest $request, FlockSale $flockSale)
    {
        $this->authorize('update', $flockSale);

        $data = $request->validated();
        $flock = Flock::findOrFail($data['flock_id']);

        // Vérifier que la vente est possible (en tenant compte de l'ancienne vente si elle n'est pas encore approuvée ?)
        // Pour simplifier, on vérifie juste la nouvelle quantité par rapport au stock actuel du lot.
        if (!$flock->canSell($data['quantity'])) {
            return back()->withErrors(['quantity' => 'Quantité insuffisante dans le lot.'])->withInput();
        }

        $data['total'] = $data['quantity'] * $data['unit_price'];
        $flockSale->update($data);

        return redirect()->route('flock-sales.index')->with('success', 'Vente mise à jour.');
    }

    public function destroy(FlockSale $flockSale)
    {
        $this->authorize('delete', $flockSale);

        $flockSale->delete();

        return redirect()->route('flock-sales.index')->with('success', 'Vente supprimée.');
    }

    public function approve(ApproveFlockSaleRequest $request, FlockSale $flockSale)
    {
        $this->authorize('approve', $flockSale);

        $flock = $flockSale->flock;

        // Vérifier à nouveau que la vente est possible (le stock a peut-être changé depuis la création)
        if (!$flock->canSell($flockSale->quantity)) {
            return back()->withErrors(['quantity' => 'Stock insuffisant pour valider cette vente.'])->withInput();
        }

        // Appliquer la vente au lot
        $flock->applySale($flockSale);

        // Marquer la vente comme approuvée
        $flockSale->status = 'approved';
        $flockSale->approved_by = auth()->id();
        $flockSale->approved_at = now();
        $flockSale->save();

        return redirect()->back()->with('success', 'Vente approuvée et stock mis à jour.');
    }

    public function reject(RejectFlockSaleRequest $request, FlockSale $flockSale)
    {
        $this->authorize('reject', $flockSale);

        $flockSale->status = 'rejected';
        $flockSale->approved_by = auth()->id();
        $flockSale->approved_at = now();
        $flockSale->rejection_reason = $request->reason;
        $flockSale->save();

        return redirect()->back()->with('success', 'Vente rejetée.');
    }
}
