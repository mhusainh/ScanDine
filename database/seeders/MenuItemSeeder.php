<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuItem;
use App\Models\Category;
use App\Models\ModifierGroup;

class MenuItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();
        $modifierGroups = ModifierGroup::all();

        // Menu items templates per category
        $menuTemplates = [
            'Makanan Berat' => [
                ['name' => 'Nasi Goreng', 'base_price' => 25000, 'desc' => 'Nasi goreng spesial dengan telur'],
                ['name' => 'Mie Goreng', 'base_price' => 23000, 'desc' => 'Mie goreng pedas dengan sayuran'],
                ['name' => 'Nasi Ayam Geprek', 'base_price' => 28000, 'desc' => 'Ayam goreng crispy dengan sambal geprek'],
                ['name' => 'Spaghetti Bolognese', 'base_price' => 35000, 'desc' => 'Spaghetti dengan saus daging'],
                ['name' => 'Nasi Rendang', 'base_price' => 32000, 'desc' => 'Nasi dengan rendang daging sapi'],
            ],
            'Snack & Appetizer' => [
                ['name' => 'French Fries', 'base_price' => 15000, 'desc' => 'Kentang goreng renyah'],
                ['name' => 'Chicken Wings', 'base_price' => 25000, 'desc' => 'Sayap ayam goreng crispy'],
                ['name' => 'Onion Rings', 'base_price' => 18000, 'desc' => 'Bawang bombay goreng tepung'],
                ['name' => 'Spring Roll', 'base_price' => 20000, 'desc' => 'Lumpia isi sayuran'],
                ['name' => 'Nachos', 'base_price' => 22000, 'desc' => 'Tortilla chips dengan saus keju'],
            ],
            'Minuman Kopi' => [
                ['name' => 'Espresso', 'base_price' => 15000, 'desc' => 'Kopi hitam pekat'],
                ['name' => 'Americano', 'base_price' => 18000, 'desc' => 'Espresso dengan air panas'],
                ['name' => 'Cappuccino', 'base_price' => 22000, 'desc' => 'Espresso dengan susu foam'],
                ['name' => 'Latte', 'base_price' => 23000, 'desc' => 'Espresso dengan susu steamed'],
                ['name' => 'Caramel Macchiato', 'base_price' => 28000, 'desc' => 'Latte dengan sirup caramel'],
            ],
            'Minuman Non-Kopi' => [
                ['name' => 'Teh Manis', 'base_price' => 8000, 'desc' => 'Teh manis dingin'],
                ['name' => 'Lemon Tea', 'base_price' => 12000, 'desc' => 'Teh dengan perasan lemon'],
                ['name' => 'Chocolate', 'base_price' => 18000, 'desc' => 'Cokelat panas atau dingin'],
                ['name' => 'Matcha Latte', 'base_price' => 25000, 'desc' => 'Matcha dengan susu'],
                ['name' => 'Fruit Smoothie', 'base_price' => 22000, 'desc' => 'Smoothie buah segar'],
            ],
            'Dessert' => [
                ['name' => 'Pancake', 'base_price' => 20000, 'desc' => 'Pancake dengan sirup maple'],
                ['name' => 'Waffle', 'base_price' => 22000, 'desc' => 'Waffle dengan ice cream'],
                ['name' => 'Brownies', 'base_price' => 18000, 'desc' => 'Brownies cokelat hangat'],
                ['name' => 'Tiramisu', 'base_price' => 28000, 'desc' => 'Kue Italia klasik'],
                ['name' => 'Cheesecake', 'base_price' => 25000, 'desc' => 'Kue keju lembut'],
            ],
        ];

        foreach ($categories as $category) {
            $templates = $menuTemplates[$category->name] ?? [];

            // Create 20 items per category
            for ($i = 1; $i <= 20; $i++) {
                // Use template if available, otherwise generate generic
                if ($i <= count($templates)) {
                    $template = $templates[$i - 1];
                    $name = $template['name'];
                    $price = $template['base_price'];
                    $description = $template['desc'];
                } else {
                    $name = $category->name . ' Special ' . $i;
                    $price = rand(15000, 50000);
                    $description = 'Menu spesial ' . $name;
                }

                $menuItem = MenuItem::create([
                    'category_id' => $category->id,
                    'name' => $name,
                    'description' => $description,
                    'price' => $price,
                    'is_available' => true,
                    'sort_order' => $i,
                ]);

                // Attach random modifier groups to menu items
                if ($modifierGroups->count() > 0) {
                    // Get random 1-3 modifier groups
                    $randomModifiers = $modifierGroups->random(min(rand(1, 3), $modifierGroups->count()));
                    $menuItem->modifierGroups()->attach($randomModifiers->pluck('id'));
                }
            }
        }

        $this->command->info('Created 100 menu items with modifier groups attached');
    }
}
