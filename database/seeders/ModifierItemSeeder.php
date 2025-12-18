<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ModifierGroup;
use App\Models\ModifierItem;

class ModifierItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modifierItems = [
            'Tingkat Kepedasan' => [
                ['name' => 'Tidak Pedas', 'price' => 0, 'sort_order' => 1],
                ['name' => 'Sedang', 'price' => 0, 'sort_order' => 2],
                ['name' => 'Pedas', 'price' => 2000, 'sort_order' => 3],
                ['name' => 'Extra Pedas', 'price' => 3000, 'sort_order' => 4],
            ],
            'Ukuran' => [
                ['name' => 'Regular', 'price' => 0, 'sort_order' => 1],
                ['name' => 'Large', 'price' => 5000, 'sort_order' => 2],
                ['name' => 'Extra Large', 'price' => 8000, 'sort_order' => 3],
            ],
            'Tingkat Manis' => [
                ['name' => 'Normal Sugar', 'price' => 0, 'sort_order' => 1],
                ['name' => 'Less Sugar', 'price' => 0, 'sort_order' => 2],
                ['name' => 'No Sugar', 'price' => 0, 'sort_order' => 3],
                ['name' => 'Extra Sweet', 'price' => 2000, 'sort_order' => 4],
            ],
            'Topping Tambahan' => [
                ['name' => 'Telur Mata Sapi', 'price' => 5000, 'sort_order' => 1],
                ['name' => 'Ayam Goreng', 'price' => 8000, 'sort_order' => 2],
                ['name' => 'Kerupuk', 'price' => 2000, 'sort_order' => 3],
                ['name' => 'Acar', 'price' => 1000, 'sort_order' => 4],
                ['name' => 'Sambal Extra', 'price' => 2000, 'sort_order' => 5],
            ],
            'Extra' => [
                ['name' => 'Extra Espresso Shot', 'price' => 8000, 'sort_order' => 1],
                ['name' => 'Whipped Cream', 'price' => 5000, 'sort_order' => 2],
                ['name' => 'Chocolate Syrup', 'price' => 3000, 'sort_order' => 3],
                ['name' => 'Caramel Syrup', 'price' => 3000, 'sort_order' => 4],
                ['name' => 'Ice Cream Scoop', 'price' => 7000, 'sort_order' => 5],
            ],
        ];

        $groups = ModifierGroup::all();

        foreach ($groups as $group) {
            $items = $modifierItems[$group->name] ?? [];

            foreach ($items as $item) {
                ModifierItem::create([
                    'modifier_group_id' => $group->id,
                    'name' => $item['name'],
                    'price' => $item['price'],
                    'is_available' => true,
                    'sort_order' => $item['sort_order'],
                ]);
            }
        }
    }
}
