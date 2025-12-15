<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuItem extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',
        'public_id',
        'url_file',
        'is_available',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get modifier groups for this menu item (Many-to-Many)
     */
    public function modifierGroups(): BelongsToMany
    {
        return $this->belongsToMany(
            ModifierGroup::class,
            'menu_modifier_groups',
            'menu_item_id',
            'modifier_group_id'
        )->withTimestamps();
    }

    /**
     * Get order items
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
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
     * Scope by category
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Get image URL (Cloudinary)
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->url_file;
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
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }
}
