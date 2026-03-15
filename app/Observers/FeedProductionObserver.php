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
                'low_stock_threshold' => 0,
                'pmp' => 0,
                'is_active' => true,
            ]
        );

        // Calcul du prix de revient unitaire
        $feedUnitPrice = $production->quantity_produced > 0 ? $totalCost / $production->quantity_produced : 0;

        // Créer le mouvement d'entrée pour l'aliment produit (en 'pending' d'abord pour l'observer)
        $feedMovement = StockMouvement::create([
            'ingredient_id' => $feedIngredient->id,
            'type' => 'in',
            'quantity' => $production->quantity_produced,
            'unit_id' => $production->unit_id,
            'unit_price' => $feedUnitPrice,
            'reason' => "Production aliment: {$recipe->name}",
            'status' => 'pending',
            'created_by' => $production->approved_by ?? auth()->id(),
        ]);

        // Approuver pour déclencher la mise à jour du stock via StockMouvementObserver
        $feedMovement->status = 'approved';
        $feedMovement->approved_by = $production->approved_by;
        $feedMovement->approved_at = now();
        $feedMovement->save();
        
    }
}