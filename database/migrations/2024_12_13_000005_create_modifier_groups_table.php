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
        Schema::create('modifier_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Add On Topping", "Pilihan Minuman"
            $table->enum('type', ['single_choice', 'multiple_choice'])->default('multiple_choice');
            $table->integer('min_selection')->default(0);
            $table->integer('max_selection')->nullable(); // null = unlimited
            $table->boolean('is_required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modifier_groups');
    }
};
