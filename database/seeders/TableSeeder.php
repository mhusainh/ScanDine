<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Table;

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 10 tables
        for ($i = 1; $i <= 10; $i++) {
            Table::create([
                'table_number' => 'T' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'status' => 'available',
            ]);
        }
    }
}
