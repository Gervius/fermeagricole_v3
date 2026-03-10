<?php

namespace App\Http\Controllers;

use App\Models\FeedProduction;
use App\Models\Recipe;
use App\Models\Unit;
use App\Models\StockMouvement;
use App\Models\Ingredient;
use App\Http\Requests\StoreFeedProductionRequest;
use App\Http\Requests\SubmitFeedProductionRequest;
use App\Http\Requests\ApproveFeedProductionRequest;
use App\Http\Requests\RejectFeedProductionRequest;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class FeedProductionController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $productions = FeedProduction::with(['recipe', 'unit', 'creator', 'approver'])
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->recipe_id, fn($q, $id) => $q->where('recipe_id', $id))
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(fn($p) => [
                'id' => $p->id,
                'recipe' => $p->recipe->name,
                'quantity' => $p->quantity_produced,
                'unit' => $p->unit->symbol,
                'production_date' => $p->production_date->format('d/m/Y'),
                'status' => $p->status,
                'created_by' => $p->creator->name,
                'created_at' => $p->created_at->format('d/m/Y H:i'),
                'approved_by' => $p->approver?->name,
                'approved_at' => $p->approved_at?->format('d/m/Y H:i'),
                'can_edit' => auth()->user()->can('update', $p),
                'can_delete' => auth()->user()->can('delete', $p),
                'can_submit' => auth()->user()->can('submit', $p),
                'can_approve' => auth()->user()->can('approve', $p),
                'can_reject' => auth()->user()->can('reject', $p),
            ]);

        $recipes = Recipe::all(['id', 'name']);

        return Inertia::render('FeedProductions/Index', [
            'productions' => $productions,
            'recipes' => $recipes,
            'filters' => $request->only(['status', 'recipe_id']),
        ]);
    }

    public function create()
    {
        $recipes = Recipe::with('ingredients.ingredient', 'unit')->get();
        $units = Unit::all();
        return Inertia::render('FeedProductions/Create', [
            'recipes' => $recipes,
            'units' => $units,
        ]);
    }

    public function store(StoreFeedProductionRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();
        $data['status'] = 'draft';

        FeedProduction::create($data);

        return redirect()->route('feed-productions.index')
            ->with('success', 'Production créée en brouillon.');
    }

    public function show(FeedProduction $feedProduction)
    {
        $feedProduction->load(['recipe.ingredients.ingredient', 'unit', 'creator', 'approver']);
        
        return Inertia::render('FeedProductions/Show', [
            'production' => [
                'id' => $feedProduction->id,
                'recipe' => $feedProduction->recipe->name,
                'quantity' => $feedProduction->quantity_produced,
                'unit' => $feedProduction->unit->symbol,
                'production_date' => $feedProduction->production_date->format('d/m/Y'),
                'notes' => $feedProduction->notes,
                'status' => $feedProduction->status,
                'created_by' => $feedProduction->creator->name,
                'created_at' => $feedProduction->created_at->format('d/m/Y H:i'),
                'approved_by' => $feedProduction->approver?->name,
                'approved_at' => $feedProduction->approved_at?->format('d/m/Y H:i'),
                'rejection_reason' => $feedProduction->rejection_reason,
                'can_edit' => auth()->user()->can('update', $feedProduction),
                'can_delete' => auth()->user()->can('delete', $feedProduction),
                'can_submit' => auth()->user()->can('submit', $feedProduction),
                'can_approve' => auth()->user()->can('approve', $feedProduction),
                'can_reject' => auth()->user()->can('reject', $feedProduction),
            ]
        ]);
    }

    public function edit(FeedProduction $feedProduction)
    {
        $this->authorize('update', $feedProduction);

        $recipes = Recipe::with('ingredients.ingredient', 'unit')->get();
        $units = Unit::all();
        return Inertia::render('FeedProductions/Edit', [
            'production' => $feedProduction,
            'recipes' => $recipes,
            'units' => $units,
        ]);
    }

    public function update(StoreFeedProductionRequest $request, FeedProduction $feedProduction)
    {
        $this->authorize('update', $feedProduction);

        $feedProduction->update($request->validated());

        return redirect()->route('feed-productions.index')
            ->with('success', 'Production mise à jour.');
    }

    public function destroy(FeedProduction $feedProduction)
    {
        $this->authorize('delete', $feedProduction);

        $feedProduction->delete();

        return redirect()->route('feed-productions.index')
            ->with('success', 'Production supprimée.');
    }

    public function submit(SubmitFeedProductionRequest $request, FeedProduction $feedProduction)
    {
        $this->authorize('submit', $feedProduction);

        $feedProduction->status = 'pending';
        $feedProduction->save();

        return redirect()->route('feed-productions.index')
            ->with('success', 'Production soumise pour approbation.');
    }

    public function approve(ApproveFeedProductionRequest $request, FeedProduction $feedProduction)
    {
        $this->authorize('approve', $feedProduction);

        // Vérifier que la recette a des ingrédients
        $recipe = $feedProduction->recipe;
        if ($recipe->ingredients->isEmpty()) {
            return back()->withErrors(['recipe' => 'La recette ne contient aucun ingrédient.']);
        }

        // Calculer le facteur de production par rapport au rendement de la recette
        $factor = $feedProduction->quantity_produced / $recipe->yield;

        // Pour chaque ingrédient de la recette, créer un mouvement de stock sortant (pending ou direct ?)
        // On va créer des mouvements de stock en attente pour chaque ingrédient
        foreach ($recipe->ingredients as $ingredient) {
            $quantityNeeded = $ingredient->pivot->quantity * $factor;
            
            // Créer un mouvement de sortie pour cet ingrédient
            StockMouvement::create([
                'ingredient_id' => $ingredient->id,
                'type' => 'out',
                'quantity' => $quantityNeeded,
                'unit_id' => $ingredient->pivot->unit_id,
                'reason' => "Production aliment: {$recipe->name}",
                'status' => 'pending', // en attente d'approbation ? 
                // Mais ici, on est déjà dans l'approbation de la production.
                // On pourrait approuver directement ces mouvements, ou les laisser en pending.
                // Pour simplifier, on va les approuver directement avec le même approbateur.
                'created_by' => auth()->id(),
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'status' => 'approved',
            ]);
            
            // Mettre à jour le stock de l'ingrédient directement ? 
            // Ou on laisse le mouvement approuvé le faire via son propre mécanisme.
            // Pour éviter la duplication, on peut appeler la méthode d'approbation du mouvement,
            // mais ici on crée directement approuvé.
        }

        // Créer un mouvement d'entrée pour l'aliment produit
        // On suppose qu'il existe un ingrédient représentant cet aliment.
        // Si non, on peut le créer automatiquement ou avoir une table dédiée.
        // Pour l'exemple, on va chercher un ingrédient ayant le même nom que la recette, ou on le crée.
        $feedIngredient = Ingredient::firstOrCreate(
            ['name' => $recipe->name],
            [
                'reference' => 'FEED-' . $recipe->id,
                'default_unit_id' => $recipe->unit_id,
                'current_stock' => 0,
                'is_active' => true,
            ]
        );

        StockMouvement::create([
            'ingredient_id' => $feedIngredient->id,
            'type' => 'in',
            'quantity' => $feedProduction->quantity_produced,
            'unit_id' => $feedProduction->unit_id,
            'reason' => "Production aliment: {$recipe->name}",
            'status' => 'approved',
            'created_by' => auth()->id(),
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        // Mettre à jour la production
        $feedProduction->status = 'approved';
        $feedProduction->approved_by = auth()->id();
        $feedProduction->approved_at = now();
        $feedProduction->save();

        return redirect()->route('feed-productions.index')
            ->with('success', 'Production approuvée et stocks mis à jour.');
    }

    public function reject(RejectFeedProductionRequest $request, FeedProduction $feedProduction)
    {
        $this->authorize('reject', $feedProduction);

        $feedProduction->status = 'rejected';
        $feedProduction->approved_by = auth()->id(); // ou un champ rejected_by
        $feedProduction->approved_at = now();
        $feedProduction->rejection_reason = $request->reason;
        $feedProduction->save();

        return redirect()->route('feed-productions.index')
            ->with('success', 'Production rejetée.');
    }
}
