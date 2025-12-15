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
        Schema::create('modifier_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('modifier_group_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., "Bakso 3Pcs", "Es Teh Jumbo"
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_available')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['modifier_group_id', 'is_available']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modifier_items');
    }
};
