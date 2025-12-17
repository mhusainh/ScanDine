<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Table;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Display menu for customer (from QR scan)
     */
    public function index(Request $request, $tableUuid = null)
    {
        // Validate table UUID
        if (!$tableUuid) {
            $tableUuid = $request->query('table');
        }

        if (!$tableUuid) {
            abort(404, 'Table tidak ditemukan.');
        }

        $table = Table::where('uuid', $tableUuid)->firstOrFail();

        // Get categories with menu items
        $categories = Category::active()
            ->with(['availableMenuItems.modifierGroups.availableModifierItems'])
            ->ordered()
            ->get();

        return view('menu.index', compact('categories', 'table'));
    }

    /**
     * Show menu item detail
     */
    public function show($id)
    {
        $menuItem = MenuItem::with([
            'category',
            'modifierGroups.availableModifierItems'
        ])->findOrFail($id);

        return response()->json($menuItem);
    }
}
