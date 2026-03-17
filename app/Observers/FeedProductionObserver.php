<?php

namespace App\Observers;

use App\Models\FeedProduction;
use App\Models\StockMouvement;
use App\Models\Ingredient;
use Illuminate\Support\Facades\DB;

class FeedProductionObserver
{
    /**
     * Handle the FeedProduction "updated" event.
     */
   public function updated(FeedProduction $production)
    {
        if ($production->wasChanged('status') && $production->status === 'approved') {
            $this->applyProduction($production);
        }
    }

    protected function applyProduction(FeedProduction $production)
    {
        $recipe = $production->recipe;
        $factor = $production->quantity_produced / $recipe->yield;
        $totalCost = 0;

        foreach ($recipe->ingredients as $ingredient) {
            $quantityNeeded = $ingredient->pivot->quantity * $factor;

            // Créer un mouvement de sortie pour cet ingrédient
            $movement = StockMouvement::create([
                'ingredient_id' => $ingredient->id,
                'type' => 'out',
                'quantity' => $quantityNeeded,
                'unit_id' => $ingredient->pivot->unit_id,
                'unit_price' => $ingredient->pmp, // valorisation au PMP actuel
                'reason' => "Production aliment: {$recipe->name}",
                'status' => 'pending', // ou 'approved' directement ?
                'created_by' => $production->approved_by ?? auth()->id(),
            ]);

            // On approuve immédiatement le mouvement (car la production est approuvée)
            $movement->status = 'approved';
            $movement->approved_by = $production->approved_by;
            $movement->approved_at = now();
            $movement->save(); // Déclenche l'observateur pour la mise à jour du stock

            $totalCost += $quantityNeeded * $ingredient->pmp;
        }

            // Créer ou récupérer l'ingrédient correspondant à l'aliment
        $feedIngredient = Ingredient::firstOrCreate(
            ['name' => $recipe->name],
            [
                'reference' => 'FEED-' . $recipe->id,
                'default_unit_id' => $recipe->unit_id,
                'current_stock' => 0,
                'pmp' => 0,
                'is_active' => true,
            ]
        );

        // Créer le mouvement d'entrée pour l'aliment produit
        StockMouvement::create([
            'ingredient_id' => $feedIngredient->id,
            'type' => 'in',
            'quantity' => $feedProduction->quantity_produced,
            'unit_id' => $feedProduction->unit_id,
            'unit_price' => $feedUnitPrice,
            'reason' => "Production aliment: {$recipe->name}",
            'status' => 'approved',
            'created_by' => $feedProduction->approved_by ?? auth()->id(),
            'approved_by' => $feedProduction->approved_by,
            'approved_at' => now(),
        ]);

            // Mise à jour du stock de l'aliment sera faite par l'observateur du mouvement
        
    }
}