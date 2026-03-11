<?php

namespace App\Observers;

use App\Models\Payments;

class PaymentObserver
{
    /**
     * Handle the Payments "created" event.
     */
    public function created(Payments $payments): void
    {
        $this->updateInvoicePaymentStatus($payments->invoice);
    }

    /**
     * Handle the Payments "updated" event.
     */
    public function updated(Payments $payments): void
    {
        $this->updateInvoicePaymentStatus($payments->invoice);
    }

    /**
     * Handle the Payments "deleted" event.
     */
    public function deleted(Payments $payments): void
    {
        $this->updateInvoicePaymentStatus($payments->invoice);
    }

    /**
     * Handle the Payments "restored" event.
     */
    public function restored(Payments $payments): void
    {
        $this->updateInvoicePaymentStatus($payments->invoice);
    }

    /**
     * Handle the Payments "force deleted" event.
     */
    public function forceDeleted(Payments $payments): void
    {
        $this->updateInvoicePaymentStatus($payments->invoice);
    }

    private function updateInvoicePaymentStatus($invoice): void
    {
        if (!$invoice) return;

        $totalPaid = $invoice->payments()->sum('amount');
        
        if ($totalPaid >= $invoice->total) {
            $invoice->payment_status = 'paid';
        } elseif ($totalPaid > 0) {
            $invoice->payment_status = 'partial';
        } else {
            $invoice->payment_status = 'unpaid';
        }

        $invoice->save();
    }
}
