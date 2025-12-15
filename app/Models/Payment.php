<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'amount',
        'payment_method',        // cash, online
        'payment_status',        // pending, settlement, capture, expire, cancel, deny, refund, failed
        'payment_type',          // gopay, shopeepay, bca_va, qris, dll (dari Midtrans)
        'transaction_id',        // order_id yang dikirim ke Midtrans
        'transaction_status',    // status transaksi dari Midtrans
        'fraud_status',          // accept, challenge, deny
        'signature_key',         // untuk validasi callback
        'midtrans_response',     // full response JSON dari Midtrans
        'payment_proof',         // URL bukti transfer manual (jika cash)
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'midtrans_response' => 'array',
    ];

    /**
     * Relasi ke Order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Check if payment is successful
     */
    public function isSuccess(): bool
    {
        return in_array($this->payment_status, ['settlement', 'capture']);
    }

    /**
     * Check if payment is pending
     */
    public function isPending(): bool
    {
        return $this->payment_status === 'pending';
    }

    /**
     * Check if payment is failed
     */
    public function isFailed(): bool
    {
        return in_array($this->payment_status, ['expire', 'cancel', 'deny', 'failed']);
    }
}
