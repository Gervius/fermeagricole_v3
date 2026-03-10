<?php

namespace App\Observers;

use App\Models\DailyRecord;
use App\Models\EggMovement;

class DailyRecordObserver
{
    public function updated(DailyRecord $record): void
    {
        if ($record->wasChanged('status') && $record->status === 'approved' && $record->eggs > 0) {
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
    }
}