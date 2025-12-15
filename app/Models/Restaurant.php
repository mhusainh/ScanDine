<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Restaurant extends Model
{
    protected $fillable = [
        'name',
        'address',
        'phone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all tables for this restaurant
     * Note: Saat ini single tenant, jadi tidak digunakan
     */
    public function tables(): HasMany
    {
        return $this->hasMany(Table::class);
    }
}
