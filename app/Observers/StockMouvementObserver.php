<?php

namespace App\Observers;

use App\Models\StockMouvement;
use App\Services\UnitConversionService;
use Illuminate\Support\Facades\DB;

class StockMouvementObserver
{
    protected $conversionService;

    public function __construct(UnitConversionService $conversionService)
    {
        $this->conversionService = $conversionService;
    }

    public function created(StockMouvement $movement)
    {
        // Rien à la création, car le mouvement est en pending
    }

    public function updated(StockMouvement $movement)
    {
        // Ne déclencher que si le statut passe à 'approved'
        if ($movement->wasChanged('status') && $movement->status === 'approved') {
            $this->applyMovement($movement);
        }
    }

    protected function applyMovement(StockMouvement $movement)
    {
        $ingredient = $movement->ingredient;
        $unit = $movement->unit;
        $defaultUnit = $ingredient->defaultUnit;

        // Conversion dans l'unité par défaut
        $quantityInDefaultUnit = $this->conversionService->convert(
            $movement->quantity,
            $unit,
            $defaultUnit
        );

        switch ($movement->type) {
            case 'in':
                // Entrée : mise à jour du PMP
                $priceInDefaultUnit = $movement->unit_price;
                if ($unit->id !== $defaultUnit->id && $movement->unit_price) {
                    // Convertir le prix unitaire
                    $priceInDefaultUnit = $movement->unit_price * $this->conversionService->convert(1, $unit, $defaultUnit);
                }

                $oldValue = $ingredient->current_stock * $ingredient->pmp;
                $newValue = $quantityInDefaultUnit * ($priceInDefaultUnit ?: 0);
                $newStock = $ingredient->current_stock + $quantityInDefaultUnit;

                if ($newStock > 0) {
                    $ingredient->pmp = ($oldValue + $newValue) / $newStock;
                }
                $ingredient->current_stock = $newStock;
                break;

            case 'out':
                // Sortie : on ne modifie pas le PMP, on décrémente simplement le stock
                $ingredient->current_stock -= $quantityInDefaultUnit;
                break;

            case 'adjust':
                // Ajustement : la quantité de mouvement est la différence (delta)
                // Ex: si adjust de +10, stock augmente de 10. Si adjust de -5, stock diminue de 5.
                $newStock = $ingredient->current_stock + $quantityInDefaultUnit;

                if ($quantityInDefaultUnit > 0 && $movement->unit_price && $movement->unit_price > 0) {
                    // Si ajustement positif avec un prix (comme une entrée de rattrapage)
                    $priceInDefaultUnit = $movement->unit_price;
                    if ($unit->id !== $defaultUnit->id) {
                        $priceInDefaultUnit = $movement->unit_price * $this->conversionService->convert(1, $unit, $defaultUnit);
                    }
                    $oldValue = $ingredient->current_stock * $ingredient->pmp;
                    $newValue = $quantityInDefaultUnit * $priceInDefaultUnit;

                    if ($newStock > 0) {
                        $ingredient->pmp = ($oldValue + $newValue) / $newStock;
                    }
                }
                // Si quantité négative, on ne change pas le PMP, on ajuste juste le stock.

                $ingredient->current_stock = $newStock;
                break;
        }

        $ingredient->save();
    }
}