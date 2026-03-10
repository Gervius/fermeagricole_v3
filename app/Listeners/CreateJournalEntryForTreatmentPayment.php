<?php

namespace App\Listeners;

use App\Events\TreatmentPaid;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CreateJournalEntryForTreatmentPayment
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(TreatmentPaid $event): void
    {
        //
    }
}
