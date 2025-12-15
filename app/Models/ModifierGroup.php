<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ModifierGroup extends Model
{
    protected $fillable = [
        'name',
        'type',
        'min_selection',
        'max_selection',
        'is_required',
        'sort_order',
    ];

    protected $casts = [
        'min_selection' => 'integer',
        'max_selection' => 'integer',
        'is_required' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get all modifier items in this group
     */
    public function modifierItems(): HasMany
    {
        return $this->hasMany(ModifierItem::class);
    }

    /**
     * Get only available modifier items
     */
    public function availableModifierItems(): HasMany
    {
        return $this->hasMany(ModifierItem::class)
            ->where('is_available', true)
            ->orderBy('sort_order');
    }

    /**
     * Get menu items that use this modifier group (Many-to-Many)
     */
    public function menuItems(): BelongsToMany
    {
        return $this->belongsToMany(
            MenuItem::class,
            'menu_modifier_groups',
            'modifier_group_id',
            'menu_item_id'
        )->withTimestamps();
    }

    /**
     * Check if this is single choice
     */
    public function isSingleChoice(): bool
    {
        return $this->type === 'single_choice';
    }

    /**
     * Check if this is multiple choice
     */
    public function isMultipleChoice(): bool
    {
        return $this->type === 'multiple_choice';
    }

    /**
     * Check if this modifier is required
     */
    public function isRequired(): bool
    {
        return $this->is_required;
    }

    /**
     * Scope for ordered by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
