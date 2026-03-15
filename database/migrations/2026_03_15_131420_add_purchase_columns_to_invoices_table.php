<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->enum('type', ['sale', 'purchase'])->default('sale')->after('id');
            $table->decimal('commercial_discount', 15, 2)->default(0)->after('subtotal')->comment('Remise, Rabais, Ristourne');
            $table->string('reference_document')->nullable()->after('number')->comment('Numéro de facture du fournisseur ou bon de livraison');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['type', 'commercial_discount', 'reference_document']);
        });
    }
};
