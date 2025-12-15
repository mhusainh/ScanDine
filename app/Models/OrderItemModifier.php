<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItemModifier extends Model
{
    protected $fillable = [
        'order_item_id',
        'modifier_item_id',
        'price',
        'quantity',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    /**
     * Get the order item
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /**
     * Get the modifier item
     */
    public function modifierItem(): BelongsTo
    {
        return $this->belongsTo(ModifierItem::class);
    }

    /**
     * Calculate total price
     */
    public function getTotalAttribute(): float
    {
        return $this->price * $this->quantity;
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        if ($this->price == 0) {
            return 'Gratis';
        }
        return '+ Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get formatted total
     */
    public function getFormattedTotalAttribute(): string
    {
        if ($this->total == 0) {
            return 'Gratis';
        }
        return 'Rp ' . number_format($this->total, 0, ',', '.');
    }
}
