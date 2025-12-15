<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ModifierItem extends Model
{
    protected $fillable = [
        'modifier_group_id',
        'name',
        'price',
        'is_available',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the modifier group
     */
    public function modifierGroup(): BelongsTo
    {
        return $this->belongsTo(ModifierGroup::class);
    }

    /**
     * Get order item modifiers
     */
    public function orderItemModifiers(): HasMany
    {
        return $this->hasMany(OrderItemModifier::class);
    }

    /**
     * Scope for available items
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope for ordered by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Check if item is available
     */
    public function isAvailable(): bool
    {
        return $this->is_available;
    }

    /**
     * Format price to Rupiah
     */
    public function getFormattedPriceAttribute(): string
    {
        if ($this->price == 0) {
            return 'Gratis';
        }
        return '+ Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get display name with price
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->price == 0) {
            return $this->name;
        }
        return $this->name . ' (' . $this->formatted_price . ')';
    }
}
