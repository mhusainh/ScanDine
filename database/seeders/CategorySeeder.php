<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Makanan Berat', 'sort_order' => 1],
            ['name' => 'Snack & Appetizer', 'sort_order' => 2],
            ['name' => 'Minuman Kopi', 'sort_order' => 3],
            ['name' => 'Minuman Non-Kopi', 'sort_order' => 4],
            ['name' => 'Dessert', 'sort_order' => 5],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
