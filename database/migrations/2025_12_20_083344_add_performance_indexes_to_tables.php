<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add index to order_items.menu_item_id for popular items query
        Schema::table('order_items', function (Blueprint $table) {
            $table->index('menu_item_id');
        });

        // Add index to menu_items.category_id for filtering
        Schema::table('menu_items', function (Blueprint $table) {
            $table->index('category_id');
            $table->index('is_available');
        });

        // Add compound index to orders for filtering by status and date (commonly used in dashboard)
        Schema::table('orders', function (Blueprint $table) {
            // Index for: where('status', '!=', 'cancelled')->sum('total_amount')
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['menu_item_id']);
        });

        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropIndex(['category_id']);
            $table->dropIndex(['is_available']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
        });
    }
};
