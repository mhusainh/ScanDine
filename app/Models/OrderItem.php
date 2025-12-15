<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'menu_item_id',
        'quantity',
        'price',
        'subtotal',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    /**
     * Get the order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the menu item
     */
    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    /**
     * Get all modifiers for this order item
     */
    public function orderItemModifiers(): HasMany
    {
        return $this->hasMany(OrderItemModifier::class);
    }

    /**
     * Calculate subtotal including modifiers
     */
    public function calculateSubtotal(): float
    {
        $basePrice = $this->price * $this->quantity;

        $modifiersTotal = $this->orderItemModifiers->sum(function ($modifier) {
            return $modifier->price * $modifier->quantity;
        });

        return $basePrice + $modifiersTotal;
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get formatted subtotal
     */
    public function getFormattedSubtotalAttribute(): string
    {
        return 'Rp ' . number_format($this->subtotal, 0, ',', '.');
    }

    /**
     * Boot method to calculate subtotal automatically
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($orderItem) {
            if ($orderItem->isDirty(['price', 'quantity'])) {
                $orderItem->subtotal = $orderItem->calculateSubtotal();
            }
        });
    }
}
