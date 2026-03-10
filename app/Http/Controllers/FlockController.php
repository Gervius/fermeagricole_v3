<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\StoreFlockRequest;
use App\Http\Requests\UpdateFlockRequest;
use App\Http\Requests\SubmitFlockRequest;
use App\Http\Requests\ApproveFlockRequest;
use App\Http\Requests\RejectFlockRequest;
use App\Models\Flock;
use App\Models\Building;
use App\Models\DailyRecord;
use Illuminate\Http\Request;
use App\Events\FlockApproved;
use Inertia\Inertia;


class FlockController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        //
    }

    /**
     * Liste des lots avec filtres éventuels.
     */
    public function index(Request $request)
    {
        $query = Flock::with(['building', 'creator', 'approver'])
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->building_id, fn($q, $id) => $q->where('building_id', $id))
            ->when($request->search, fn($q, $search) => $q->where('name', 'like', "%{$search}%"));

        $flocks = $query->paginate(15)->through(fn($flock) => [
            'id' => $flock->id,
            'name' => $flock->name,
            'building' => $flock->building->name,
            'arrival_date' => $flock->arrival_date->format('d/m/Y'),
            'initial_quantity' => $flock->initial_quantity,
            'current_quantity' => $flock->current_quantity,
            'status' => $flock->status,
            'creator' => $flock->creator->name,
            'created_at' => $flock->created_at->format('d/m/Y'),
            'can_edit' => auth()->user()->can('update', $flock),
            'can_delete' => auth()->user()->can('delete', $flock),
            'can_submit' => auth()->user()->can('submit', $flock),
            'can_approve' => auth()->user()->can('approve', $flock),
            'can_reject' => auth()->user()->can('reject', $flock),
            'can_end' => auth()->user()->can('end', $flock),
        ]);

        return Inertia::render('Flocks/Index', [
            'flocks' => $flocks,
            'buildings' => Building::select('id', 'name')->get(),
            'filters' => $request->only(['status', 'building_id', 'search']),
            // 🟢 NOUVEAU : Chargement paresseux "Inertia Pur"
            'dailyRecords' => Inertia::lazy(function () use ($request) {
                // Si on ne passe pas de flock_id, on ne charge rien
                if (!$request->flock_id) return null;

                return DailyRecord::where('flock_id', $request->flock_id)
                    ->with(['creator', 'approver'])
                    ->orderBy('date', 'desc')
                    // ⚠️ IMPORTANT : On renomme le paramètre de pagination 'page' en 'records_page'
                    // pour ne pas créer de conflit avec la pagination principale des 'flocks' en arrière-plan
                    ->paginate(5, ['*'], 'records_page')
                    ->through(fn ($record) => [
                        'id' => $record->id,
                        'date' => $record->date->format('Y-m-d'),
                        'losses' => $record->losses,
                        'eggs' => $record->eggs,
                        'notes' => $record->notes,
                        'status' => $record->status,
                        'created_by' => $record->creator->name,
                        'approved_by' => $record->approver?->name,
                        'approved_at' => $record->approved_at?->format('d/m/Y H:i'),
                        'rejection_reason' => $record->rejection_reason,
                        'can_approve' => auth()->user()->can('approve', $record),
                        'can_reject' => auth()->user()->can('reject', $record),
                    ]);
            }),
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create()
    {
        $buildings = Building::all(['id', 'name']);
        return Inertia::render('Flocks/Create', ['buildings' => $buildings]);
    }

    /**
     * Enregistrement d'un nouveau lot (statut brouillon).
     */
    public function store(StoreFlockRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();
        $data['status'] = 'draft';
        $data['current_quantity'] = $data['initial_quantity']; // au départ, égal

        Flock::create($data);

        return redirect()->route('generation')->with('success', 'Lot créé en brouillon.');
    }

    /**
     * Affichage d'un lot (pour voir les détails).
     */
    public function show(Flock $flock)
    {
        $flock->load(['building', 'creator', 'approver']);

        // Récupérer les enregistrements quotidiens (avec pagination ou simple liste)
        $dailyRecords = $flock->dailyRecords()
            ->with(['creator', 'approver'])
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn ($record) => [
                'id' => $record->id,
                'date' => $record->date->format('Y-m-d'),
                'losses' => $record->losses,
                'eggs' => $record->eggs,
                'notes' => $record->notes,
                'status' => $record->status,
                'created_by' => $record->creator->name,
                'approved_by' => $record->approver?->name,
                'approved_at' => $record->approved_at?->format('d/m/Y H:i'),
                'rejection_reason' => $record->rejection_reason,
                'can_approve' => auth()->user()->can('approve', $record),
                'can_reject' => auth()->user()->can('reject', $record),
        ]);
        //TODO : ajouter les traitements récents dans les détails du lot
        // 
        // $treatments = $flock->treatments()
        //     ->with('creator')
        //     ->orderBy('treatment_date', 'desc')
        //     ->limit(10)
        //     ->get()
        //     ->map(fn($t) => [
        //         'id' => $t->id,
        //         'treatment_date' => $t->treatment_date->format('d/m/Y'),
        //         'type' => $t->type,
        //         'name' => $t->name,
        //         'doses' => $t->doses,
        //         'veterinarian' => $t->veterinarian,
        //         'status' => $t->status,
        //         'cost' => $t->cost,
        // ]);
        

        return Inertia::render('Flocks/Show', [
            'flock' => [
                // ... toutes les infos du lot
                'id' => $flock->id,
                'name' => $flock->name,
                'building' => $flock->building->name,
                'arrival_date' => $flock->arrival_date->format('Y-m-d'),
                'initial_quantity' => $flock->initial_quantity,
                'current_quantity' => $flock->current_quantity,
                'status' => $flock->status,
                'notes' => $flock->notes,
                'creator' => $flock->creator->name,
                'approver' => $flock->approver?->name,
                'approved_at' => $flock->approved_at?->format('d/m/Y H:i'),
                'can_edit' => auth()->user()->can('update', $flock),
                'can_delete' => auth()->user()->can('delete', $flock),
                'can_submit' => auth()->user()->can('submit', $flock),
                'can_approve' => auth()->user()->can('approve', $flock),
                'can_reject' => auth()->user()->can('reject', $flock),
            ],
            'dailyRecords' => $dailyRecords,
            //'recentTreatments' => $treatments
        ]);
    }

    /**
     * Formulaire d'édition (uniquement si modifiable).
     */
    public function edit(Flock $flock)
    {
        $this->authorize('edit flocks', $flock);

        $buildings = Building::all(['id', 'name']);
        return Inertia::render('Flocks/Edit', [
            'flock' => [
                'id' => $flock->id,
                'name' => $flock->name,
                'building_id' => $flock->building_id,
                'arrival_date' => $flock->arrival_date->format('Y-m-d'),
                'initial_quantity' => $flock->initial_quantity,
                'notes' => $flock->notes,
            ],
            'buildings' => $buildings,
        ]);
    }

    /**
     * Mise à jour (uniquement si modifiable).
     */
    public function update(UpdateFlockRequest $request, Flock $flock)
    {
        $this->authorize('update', $flock);
        $data = $request->validated();
        $data['current_quantity'] = $data['initial_quantity']; // si on change la quantité initiale, on réinitialise la quantité actuelle

        $flock->update($data);

        return redirect()->route('generation')->with('success', 'Lot mis à jour.');
    }

    /**
     * Suppression (uniquement si brouillon).
     */
    public function destroy(Flock $flock)
    {
        $this->authorize('delete', $flock);

        $flock->delete();

        return redirect()->route('generation')->with('success', 'Lot supprimé.');
    }

    /**
     * Soumettre pour approbation.
     */
    public function submit(SubmitFlockRequest $request, Flock $flock)
    {
        $this->authorize('submit flocks', $flock);

        $flock->status = 'pending';
        $flock->save();

        return redirect()->route('generation')->with('success', 'Lot soumis pour approbation.');
    }

    /**
     * Approuver (passe en actif).
     */
    public function approve(ApproveFlockRequest $request, Flock $flock)
    {
        $this->authorize('approve', $flock);

        // Vérifier qu'il n'y a pas déjà un lot actif et non terminé dans le même bâtiment
        $activeFlock = Flock::where('building_id', $flock->building_id)
            ->where('status', 'active')
            ->whereNull('ended_at')
            ->where('id', '!=', $flock->id)
            ->first();

        if ($activeFlock) {
            $error = "Ce bâtiment a déjà un lot actif : {$activeFlock->name}. Veuillez le terminer avant d'activer un nouveau lot.";
            if ($request->wantsJson()) {
                return response()->json(['message' => $error, 'error' => $error], 422);
            }
            return back()->withErrors(['building' => $error])->with('error', $error);
        }

        $flock->status = 'active';
        $flock->approved_by = auth()->id();
        $flock->approved_at = now();
        $flock->save();

        event(new FlockApproved($flock));

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Lot approuvé et actif.', 'flock' => $flock]);
        }

        return redirect()->route('generation')->with('success', 'Lot approuvé et actif.');
    }

    /**
     * Terminer un lot (vente, mortalité, maladie, etc.).
     */
    
    public function end(Request $request, Flock $flock)
    {
        $this->authorize('end', $flock);

        $validated = $request->validate([
            'end_reason' => 'required|in:sale,mortality,disease,other',
            'notes' => 'nullable|string',
        ]);

        // Cas "Vente" : Redirection vers la création de facture
        if ($validated['end_reason'] === 'sale') {
            return redirect()->route('invoices.create', [
                'flock_id' => $flock->id,
                'type' => 'flock_liquidation'
            ]);
        }

        // Autres cas (mortalité, etc.)
        $flock->update([
            'status' => 'completed',
            'end_reason' => $validated['end_reason'],
            'ended_at' => now(),
            'notes' => $flock->notes . "\n[FIN] " . $validated['notes']
        ]);

        return redirect()->route('generation')->with('success', 'Lot terminé.');
    }

    /**
     * Rejeter (retour en brouillon).
     */
    public function reject(RejectFlockRequest $request, Flock $flock)
    {
        $this->authorize('reject', $flock);

        $flock->status = 'rejected';
        $flock->save();

        return redirect()->route('generation')->with('success', 'Lot rejeté, retour en brouillon.');
    }
}
