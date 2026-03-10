<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeedProductionRequest extends FormRequest
{
    
    public function authorize(): bool
    {
        return $this->user()->can('create feed productions');
    }

    public function rules(): array
    {
        return [
            'recipe_id' => 'required|exists:recipes,id',
            'quantity_produced' => 'required|numeric|min:0',
            'unit_id' => 'required|exists:units,id',
            'production_date' => 'required|date',
            'notes' => 'nullable|string',
        ];
    }
}
