<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Partner extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'phone',
        'email',
        'address',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function getBalanceAttribute(): float
    {
        // Solde client : Total facturé (non annulé) - Total payé
        $totalInvoiced = $this->invoices()
            ->where('status', '!=', 'cancelled')
            ->sum('total');
            
        $totalPaid = \App\Models\Payments::whereHas('invoice', function ($query) {
                $query->where('partner_id', $this->id)
                      ->where('status', '!=', 'cancelled');
            })->sum('amount');

        return $totalInvoiced - $totalPaid;
    }
}
