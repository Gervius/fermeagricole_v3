<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Flock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    /**
     * Liste des factures avec filtres de paiement.
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['creator'])
            ->when($request->search, function ($q, $search) {
                $q->where('number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%");
            })
            ->when($request->payment_status, fn($q, $status) => $q->where('payment_status', $status));

        // Pagination logic
        $invoices = $query->latest()->paginate(15)->through(fn($invoice) => [
            'id' => $invoice->id,
            'number' => $invoice->number,
            'customer_name' => $invoice->customer_name,
            'date' => $invoice->date->format('d/m/Y'),
            'due_date' => $invoice->due_date ? $invoice->due_date->format('d/m/Y') : null,
            'total' => $invoice->total,
            'remaining_amount' => $invoice->remaining_amount,
            'status' => $invoice->status,
            'payment_status' => $invoice->payment_status,
            'is_overdue' => $invoice->due_date && $invoice->due_date->isPast() && $invoice->payment_status !== 'paid',
            'created_by' => $invoice->creator->name,
        ]);

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'payment_status']),
            'stats' => [
                'total_revenue' => Invoice::whereNotIn('status', ['draft', 'cancelled'])->sum('total'),
                'total_collected' => \App\Models\Payments::sum('amount'),
                'total_receivable' => Invoice::whereNotIn('status', ['draft', 'cancelled'])
                                        ->get()
                                        ->sum(fn($inv) => $inv->remaining_amount),
                'overdue_count' => Invoice::whereNotIn('status', ['draft', 'cancelled'])
                                        ->where('payment_status', '!=', 'paid')
                                        ->whereNotNull('due_date')
                                        ->where('due_date', '<', now()->startOfDay())
                                        ->count(),
            ]
        ]);
    }

    /**
     * Création de facture avec support d'importation (Flock ou Egg).
     */
    public function create(Request $request)
    {
        $import = null;
        if ($request->has('source_id')) {
            $import = [
                'itemable_id' => $request->source_id,
                'itemable_type' => $request->source_type === 'flock' ? Flock::class : 'Egg',
                'description' => $request->description,
                'quantity' => (float) $request->quantity,
                'unit_price' => 0,
            ];
        }

        return Inertia::render('Invoices/Create', [
            'import' => $import,
            'activeFlocks' => Flock::active()->get(['id', 'name']),
            'customers' => \App\Models\Partner::where('is_active', true)
                                              ->whereIn('type', ['customer', 'both'])
                                              ->get(['id', 'name']),
            'nextInvoiceNumber' => 'FAC-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 4, '0', STR_PAD_LEFT)
        ]);
    }

    /**
     * Enregistrement atomique (Transaction) de la facture et de ses lignes.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|unique:invoices',
            'partner_id' => 'required|exists:partners,id',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.itemable_id' => 'nullable|integer',
            'items.*.itemable_type' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $subtotal = collect($validated['items'])->sum(fn($i) => $i['quantity'] * $i['unit_price']);

            // Trouver le nom du client via son ID pour la redondance
            $partner = \App\Models\Partner::find($validated['partner_id']);

            $invoice = Invoice::create([
                'number' => $validated['number'],
                'partner_id' => $validated['partner_id'],
                'customer_name' => $partner->name, // Conservé pour historique au cas où le partenaire est supprimé
                'date' => $validated['date'],
                'subtotal' => $subtotal,
                'total' => $subtotal, // Ajoutez ici la logique de taxe si nécessaire
                'status' => 'draft',
                'payment_status' => 'unpaid',
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                    'itemable_id' => $item['itemable_id'],
                    'itemable_type' => $item['itemable_type'],
                ]);
            }
        });

        return redirect()->route('invoices.index')->with('success', 'Facture enregistrée. En attente de validation.');
    }

    /**
     * Validation de la facture (déclenche l'Observer pour la Compta et les Stocks).
     */
    public function approve(Invoice $invoice)
    {
        $this->authorize('approve', $invoice);

        $invoice->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Facture approuvée. Les stocks et journaux ont été mis à jour.');
    }

    public function show(Invoice $invoice)
    {
        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice->load(['items', 'payments', 'creator', 'approver']),
            'remaining_amount' => $invoice->total - $invoice->payments()->sum('amount'),
        ]);
    }

    /**
     * Enregistrer un paiement (complet ou partiel).
     */
    public function addPayment(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:' . ($invoice->total - $invoice->payments()->sum('amount')),
            'payment_date' => 'required|date',
            'method' => 'required|string', // Espèces, Orange Money, Wave, Virement
            'reference' => 'nullable|string',
        ]);

        $invoice->payments()->create([
            'amount' => $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'method' => $validated['method'],
            'reference' => $validated['reference'],
            'created_by' => auth()->id(),
        ]);

        // Mise à jour automatique du statut de paiement
        $totalPaid = $invoice->payments()->sum('amount');
        if ($totalPaid >= $invoice->total) {
            $invoice->update(['payment_status' => 'paid']);
        } else {
            $invoice->update(['payment_status' => 'partial']);
        }

        return back()->with('success', 'Paiement enregistré avec succès.');
    }

    /**
     * Annuler une facture (avec gestion des stocks et compta).
     */
    public function cancel(Request $request, Invoice $invoice)
    {
        $this->authorize('cancel', $invoice);

        $request->validate(['reason' => 'required|string|min:10']);

        DB::transaction(function () use ($invoice, $request) {
            $invoice->update([
                'status' => 'cancelled',
                'notes' => $invoice->notes . "\n[ANNULATION] Motif : " . $request->reason
            ]);
            
            // L'Observer s'occupera d'annuler les mouvements de stock et la compta
        });

        return redirect()->route('invoices.index')->with('warning', 'Facture annulée.');
    }

    /**
     * Export PDF de la facture.
     */
    public function downloadPdf(Invoice $invoice)
    {
        $invoice->load(['items', 'payments']);
        
        $pdf = Pdf::loadView('pdfs.invoice', compact('invoice'));
        
        return $pdf->download("Facture_{$invoice->number}.pdf");
    }
}