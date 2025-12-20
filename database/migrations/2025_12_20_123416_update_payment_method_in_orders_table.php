<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify the check constraint for payment_method on orders table
        // Original was: ['online', 'offline']
        // New requirement: ['online', 'cash'] to match StoreCheckoutRequest and frontend

        // We use raw SQL because modifying enum constraints in Postgres via Eloquent is tricky
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check");
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('online', 'cash'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check");
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('online', 'offline'))");
    }
};
