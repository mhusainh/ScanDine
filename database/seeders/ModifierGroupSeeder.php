<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ModifierGroup;

class ModifierGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = [
            [
                'name' => 'Tingkat Kepedasan',
                'type' => 'single_choice',
                'min_selection' => 1,
                'max_selection' => 1,
                'is_required' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Ukuran',
                'type' => 'single_choice',
                'min_selection' => 1,
                'max_selection' => 1,
                'is_required' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Tingkat Manis',
                'type' => 'single_choice',
                'min_selection' => 1,
                'max_selection' => 1,
                'is_required' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Topping Tambahan',
                'type' => 'multiple_choice',
                'min_selection' => 0,
                'max_selection' => 5,
                'is_required' => false,
                'sort_order' => 4,
            ],
            [
                'name' => 'Extra',
                'type' => 'multiple_choice',
                'min_selection' => 0,
                'max_selection' => 3,
                'is_required' => false,
                'sort_order' => 5,
            ],
        ];

        foreach ($groups as $group) {
            ModifierGroup::create($group);
        }
    }
}
