<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Table;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Display menu for customer (from QR scan)
     */
    public function index(Request $request)
    {
        // Validate table UUID
        $tableUuid = $request->query('table');
        
        if (!$tableUuid) {
            return response()->json([
                'success' => false,
                'message' => 'Table UUID is required'
            ], 400);
        }

        // Validate UUID format
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $tableUuid)) {
            return response()->json([
                'success' => false,
                'message' => 'Table tidak ditemukan'
            ], 404);
        }

        $table = Table::where('uuid', $tableUuid)->first();

        if (!$table) {
            return response()->json([
                'success' => false,
                'message' => 'Table tidak ditemukan'
            ], 404);
        }

        // Get search and filter parameters
        $search = $request->query('search');
        $categoryId = $request->query('category');
        $minPrice = $request->query('min_price');
        $maxPrice = $request->query('max_price');
        $available = $request->query('available'); // 1 or 0

        // Get categories with menu items
        $categoriesQuery = Category::active();
        
        // Filter by specific category if provided
        if ($categoryId) {
            $categoriesQuery->where('id', $categoryId);
        }

        $categories = $categoriesQuery
            ->with(['menuItems' => function($query) use ($search, $minPrice, $maxPrice, $available) {
                // Filter by availability (default: only available items)
                if ($available !== null && $available !== '') {
                    $query->where('is_available', $available == 1);
                } else {
                    $query->where('is_available', true);
                }
                
                // Apply search filter
                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('name', 'ILIKE', '%' . $search . '%')
                          ->orWhere('description', 'ILIKE', '%' . $search . '%');
                    });
                }

                // Filter by minimum price
                if ($minPrice !== null && $minPrice !== '') {
                    $query->where('price', '>=', $minPrice);
                }

                // Filter by maximum price
                if ($maxPrice !== null && $maxPrice !== '') {
                    $query->where('price', '<=', $maxPrice);
                }
                
                $query->with(['modifierGroups' => function($q) {
                        $q->with(['modifierItems' => function($mq) {
                            $mq->where('is_available', true)
                                ->orderBy('sort_order');
                        }])->orderBy('sort_order');
                    }])
                    ->orderBy('sort_order');
            }])
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'table' => [
                    'uuid' => $table->uuid,
                    'table_number' => $table->table_number,
                    'status' => $table->status
                ],
                'categories' => $categories
            ]
        ]);
    }

    /**
     * Show menu item detail
     */
    public function show($id)
    {
        $menuItem = MenuItem::with([
            'category',
            'modifierGroups' => function($query) {
                $query->with(['modifierItems' => function($q) {
                    $q->where('is_available', true)
                        ->orderBy('sort_order');
                }])->orderBy('sort_order');
            }
        ])->find($id);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $menuItem
        ]);
    }
}
