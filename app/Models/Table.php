<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Table extends Model
{
    protected $fillable = [
        'table_number',
        'uuid',
        'status',
    ];

    protected $casts = [
        'uuid' => 'string',
    ];

    /**
     * Boot method to generate UUID
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($table) {
            if (empty($table->uuid)) {
                $table->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get all orders for this table
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get active orders (not completed or cancelled)
     */
    public function activeOrders(): HasMany
    {
        return $this->hasMany(Order::class)
            ->whereNotIn('status', ['completed', 'cancelled']);
    }

    /**
     * Get QR code URL
     */
    public function getQrCodeUrlAttribute(): string
    {
        return route('menu.index', ['table' => $this->uuid]);
    }

    /**
     * Check if table is available
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    /**
     * Check if table is occupied
     */
    public function isOccupied(): bool
    {
        return $this->status === 'occupied';
    }
}
