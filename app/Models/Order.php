<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'table_id',
        'order_number',
        'customer_name',
        'total_amount',
        'status',           // pending, confirmed, preparing, served, completed, cancelled
        'payment_status',   // unpaid, paid
        'payment_method',   // online, offline
        'notes',
        'completed_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    /**
     * Relasi ke Table
     */
    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    /**
     * Relasi ke Order Items
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Relasi ke Payment
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Generate order number
     */
    public static function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $lastOrder = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastOrder ? (int) substr($lastOrder->order_number, -3) + 1 : 1;

        return 'ORD-' . $date . '-' . str_pad($number, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Scope untuk filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk filter by payment status
     */
    public function scopeByPaymentStatus($query, $paymentStatus)
    {
        return $query->where('payment_status', $paymentStatus);
    }

    /**
     * Check if order is paid
     */
    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Check if order is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
