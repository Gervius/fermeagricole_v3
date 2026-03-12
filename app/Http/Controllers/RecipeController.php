<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Recipe;
use App\Models\Ingredient;
use App\Models\Unit;
use App\Http\Requests\StoreRecipeRequest;
use App\Http\Requests\UpdateRecipeRequest;
use Inertia\Inertia;

class RecipeController extends Controller
{
    
    public function index()
    {
        $recipes = Recipe::with('unit')->paginate(15);
        return Inertia::render('Recipes/Index', ['recipes' => $recipes]);
    }

    public function create()
    {
        $ingredients = Ingredient::all(['id', 'name', 'default_unit_id']);
        $units = Unit::all();
        return Inertia::render('Recipes/Create', [
            'ingredients' => $ingredients,
            'units' => $units,
        ]);
    }

    public function store(StoreRecipeRequest $request)
    {
        $recipe = Recipe::create([
            'name' => $request->name,
            'description' => $request->description,
            'yield' => $request->yield, // au lieu de 'yield'
            'unit_id' => $request->unit_id,   // au lieu de 'unit_id'
            'is_active' => $request->is_active ?? true,
        ]);

        // Attacher les ingrédients
        foreach ($request->ingredients as $ing) {
            $recipe->ingredients()->attach($ing['ingredient_id'], [
                'quantity' => $ing['quantity'],
                'unit_id' => $ing['unit_id'],
            ]);
        }

        return redirect()->route('recipesIndex')->with('success', 'Recette créée.');
    }

    public function edit(Recipe $recipe)
    {
        $recipe->load('ingredients');
        $ingredients = Ingredient::all(['id', 'name', 'default_unit_id']);
        $units = Unit::all();
        return Inertia::render('Recipes/Edit', [
            'recipe' => $recipe,
            'ingredients' => $ingredients,
            'units' => $units,
        ]);
    }

    public function update(UpdateRecipeRequest $request, Recipe $recipe)
    {
        $recipe->update($request->only(['name', 'description', 'yield', 'unit_id', 'is_active']));

        // Synchroniser les ingrédients
        $syncData = [];
        foreach ($request->ingredients as $ing) {
            $syncData[$ing['ingredient_id']] = [
                'quantity' => $ing['quantity'],
                'unit_id' => $ing['unit_id'],
            ];
        }
        $recipe->ingredients()->sync($syncData);

        return redirect()->route('recipes.index')->with('success', 'Recette mise à jour.');
    }

    public function destroy(Recipe $recipe)
    {
        $recipe->delete();
        return redirect()->route('recipes.index')->with('success', 'Recette supprimée.');
    }
}
