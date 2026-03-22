<?php

namespace App\Observers;

use App\Models\DailyRecord;
use App\Models\EggMovement;
use App\Models\StockMovement;

class DailyRecordObserver
{
    public function updated(DailyRecord $record): void
    {
        if ($record->wasChanged('status') && $record->status === 'approved') {
            if ($record->eggs > 0) {
                EggMovement::create([
                'date' => $record->date,
                'type' => 'in',
                'quantity' => $record->eggs,
                'source_id' => $record->id,
                'source_type' => DailyRecord::class,
                'created_by' => $record->approved_by,
                    'notes' => "Production du lot: " . $record->flock->name,
                ]);
            }

            if ($record->feed_consumed > 0 && $record->feed_type_id) {
                StockMovement::create([
                    'type' => 'out',
                    'date' => $record->date,
                    'recipe_id' => $record->feed_type_id,
                    'quantity' => $record->feed_consumed,
                    'unit_price' => $record->feedType ? $record->feedType->pmp : null,
                    'reason' => 'daily_record',
                    'reference' => 'RECORD-' . $record->id,
                    'notes' => "Consommation du lot: " . $record->flock->name,
                    'status' => 'approved',
                    'created_by' => $record->approved_by,
                    'approved_by' => $record->approved_by,
                    'approved_at' => now(),
                ]);
            }
        }
    }
}