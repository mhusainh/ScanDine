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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['cash', 'online']); // online = via Midtrans

            // Midtrans Status: pending, settlement, capture, expire, cancel, deny, refund
            $table->enum('payment_status', ['pending', 'settlement', 'capture', 'expire', 'cancel', 'deny', 'refund', 'failed'])->default('pending');

            // Midtrans specific fields
            $table->string('payment_type')->nullable(); // gopay, shopeepay, bca_va, qris, dll
            $table->string('transaction_id')->nullable(); // order_id dari Midtrans
            $table->string('transaction_status')->nullable(); // status transaksi dari Midtrans
            $table->string('fraud_status')->nullable(); // accept, challenge, deny
            $table->string('signature_key')->nullable(); // untuk validasi callback
            $table->text('midtrans_response')->nullable(); // full response JSON dari Midtrans

            // Manual payment fields
            $table->string('payment_proof')->nullable(); // URL bukti transfer manual (jika cash/transfer manual)

            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['order_id']);
            $table->index(['transaction_id']);
            $table->index(['payment_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
