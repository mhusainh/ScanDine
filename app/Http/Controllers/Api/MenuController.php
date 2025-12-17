<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index()
    {
        $categories = Category::with(['menuItems' => function($query) {
            $query->where('is_available', true)->orderBy('sort_order');
        }])
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

        return response()->json([
            'categories' => $categories->map(function($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'items' => $category->menuItems->map(function($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'description' => $item->description,
                            'price' => $item->price,
                            'image' => $item->url_file,
                            'category_id' => $item->category_id,
                        ];
                    }),
                ];
            })
        ]);
    }
}
