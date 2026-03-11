<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Observers\IngredientObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[ObservedBy([IngredientObserver::class])]
class Ingredient extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'reference',
        'default_unit_id',
        'current_stock',
        'pmp',
        'min_stock',
        'max_stock',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'current_stock' => 'decimal:2',
            'min_stock' => 'decimal:2',
            'max_stock' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function defaultUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'default_unit_id');
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMouvement::class);
    }

    public function recipes()
    {
        return $this->belongsToMany(Recipe::class, 'recipe_ingredients');
    }
}
