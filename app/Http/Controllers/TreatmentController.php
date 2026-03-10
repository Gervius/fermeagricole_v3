<?php
// app/Http/Controllers/TreatmentController.php

namespace App\Http\Controllers;

use App\Models\Treatment;
use App\Models\Flock;
use App\Http\Requests\StoreTreatmentRequest;
use App\Http\Requests\UpdateTreatmentRequest;
use App\Http\Requests\ApproveTreatmentRequest;
use App\Http\Requests\RejectTreatmentRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TreatmentController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        
    }

    public function index(Request $request)
    {
        $query = Treatment::with(['flock', 'creator', 'approver'])
            ->when($request->flock_id, fn($q, $id) => $q->where('flock_id', $id))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->orderBy('treatment_date', 'desc');

        $treatments = $query->paginate(20)->through(fn($treatment) => [
            'id' => $treatment->id,
            'flock_name' => $treatment->flock->name,
            'treatment_date' => $treatment->treatment_date->format('Y-m-d'),
            'veterinarian' => $treatment->veterinarian,
            'treatment_type' => $treatment->treatment_type,
            'description' => $treatment->description,
            'cost' => $treatment->cost,
            'invoice_reference' => $treatment->invoice_reference,
            'status' => $treatment->status,
            'created_by' => $treatment->creator->name,
            'created_at' => $treatment->created_at->format('d/m/Y H:i'),
            'approved_by' => $treatment->approver?->name,
            'approved_at' => $treatment->approved_at?->format('d/m/Y H:i'),
            'rejection_reason' => $treatment->rejection_reason,
            'can_edit' => auth()->user()->can('update', $treatment),
            'can_delete' => auth()->user()->can('delete', $treatment),
            'can_approve' => auth()->user()->can('approve', $treatment),
            'can_reject' => auth()->user()->can('reject', $treatment),
        ]);

        $flocks = Flock::all(['id', 'name']);

        return Inertia::render('Treatments/Index', [
            'treatments' => $treatments,
            'flocks' => $flocks,
            'filters' => $request->only(['flock_id', 'status']),
        ]);
    }

    public function create()
    {
        $flocks = Flock::all(['id', 'name']);
        return Inertia::render('Treatments/Create', ['flocks' => $flocks]);
    }

    public function store(StoreTreatmentRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();
        $data['status'] = 'draft'; // toujours en brouillon à la création

        Treatment::create($data);

        return redirect()->route('treatmentsIndex')->with('success', 'Traitement enregistré (brouillon).');
    }

    public function show(Treatment $treatment)
    {
        $treatment->load(['flock', 'creator', 'approver']);
        return Inertia::render('Treatments/Show', [
            'treatment' => [
                'id' => $treatment->id,
                'flock_name' => $treatment->flock->name,
                'treatment_date' => $treatment->treatment_date->format('Y-m-d'),
                'veterinarian' => $treatment->veterinarian,
                'treatment_type' => $treatment->treatment_type,
                'description' => $treatment->description,
                'cost' => $treatment->cost,
                'invoice_reference' => $treatment->invoice_reference,
                'status' => $treatment->status,
                'created_by' => $treatment->creator->name,
                'created_at' => $treatment->created_at->format('d/m/Y H:i'),
                'approved_by' => $treatment->approver?->name,
                'approved_at' => $treatment->approved_at?->format('d/m/Y H:i'),
                'rejection_reason' => $treatment->rejection_reason,
            ]
        ]);
    }

    public function edit(Treatment $treatment)
    {
        $this->authorize('update', $treatment);

        $flocks = Flock::all(['id', 'name']);
        return Inertia::render('Treatments/Edit', [
            'treatment' => $treatment,
            'flocks' => $flocks,
        ]);
    }

    public function update(UpdateTreatmentRequest $request, Treatment $treatment)
    {
        $this->authorize('update', $treatment);

        $treatment->update($request->validated());

        return redirect()->route('treatments.index')->with('success', 'Traitement mis à jour.');
    }

    public function destroy(Treatment $treatment)
    {
        $this->authorize('delete', $treatment);

        $treatment->delete();

        return redirect()->route('treatments.index')->with('success', 'Traitement supprimé.');
    }

    public function approve(ApproveTreatmentRequest $request, Treatment $treatment)
    {
        $this->authorize('approve', $treatment);

        $treatment->status = 'approved';
        $treatment->approved_by = auth()->id();
        $treatment->approved_at = now();
        $treatment->save();

        // Déclencher l'event pour la comptabilité
        event(new \App\Events\TreatmentApproved($treatment));

        return redirect()->back()->with('success', 'Traitement approuvé.');
    }

    public function reject(RejectTreatmentRequest $request, Treatment $treatment)
    {
        $this->authorize('reject', $treatment);

        $treatment->status = 'rejected';
        $treatment->approved_by = auth()->id(); // ou un champ rejected_by si vous voulez
        $treatment->approved_at = now();
        $treatment->rejection_reason = $request->reason;
        $treatment->save();

        return redirect()->back()->with('success', 'Traitement rejeté.');
    }
}