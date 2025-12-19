<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;

class RestaurantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Restaurant::create([
            'name' => 'ScanDine Cafe',
            'address' => 'Jl. Merdeka No. 123, Jakarta Pusat',
            'phone' => '021-12345678',
        ]);
    }
}
