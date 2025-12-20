<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModifierGroup;
use App\Http\Requests\Admin\ModifierGroup\StoreModifierGroupRequest;
use App\Http\Requests\Admin\ModifierGroup\UpdateModifierGroupRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ModifierGroupController extends Controller
{
    /**
     * Display all modifier groups
     */
    public function index(Request $request)
    {
        $query = ModifierGroup::withCount('modifierItems');

        // Search
        if ($request->has('search') && $request->search != '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by type
        if ($request->has('type') && $request->type != '') {
            $query->where('type', $request->type);
        }

        $modifierGroups = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $modifierGroups
        ]);
    }

    /**
     * Store new modifier group
     */
    public function store(StoreModifierGroupRequest $request)
    {
        Cache::forget('admin_modifier_groups_all');
        $modifierGroup = ModifierGroup::create([
            'name' => $request->name,
            'type' => $request->type,
            'min_selection' => $request->min_selection ?? 0,
            'max_selection' => $request->max_selection,
            'is_required' => $request->boolean('is_required'),
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Modifier Group berhasil ditambahkan',
            'data' => $modifierGroup
        ], 201);
    }

    /**
     * Show modifier group detail
     */
    public function show($id)
    {
        $modifierGroup = ModifierGroup::with('modifierItems')->find($id);

        if (!$modifierGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Modifier Group tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $modifierGroup
        ]);
    }

    /**
     * Update modifier group
     */
    public function update(UpdateModifierGroupRequest $request, $id)
    {
        $modifierGroup = ModifierGroup::find($id);

        if (!$modifierGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Modifier Group tidak ditemukan'
            ], 404);
        }

        Cache::forget('admin_modifier_groups_all');

        $modifierGroup->update([
            'name' => $request->name,
            'type' => $request->type,
            'min_selection' => $request->min_selection ?? 0,
            'max_selection' => $request->max_selection,
            'is_required' => $request->boolean('is_required'),
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Modifier Group berhasil diupdate',
            'data' => $modifierGroup
        ]);
    }

    /**
     * Delete modifier group
     */
    public function destroy($id)
    {
        $modifierGroup = ModifierGroup::find($id);

        if (!$modifierGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Modifier Group tidak ditemukan'
            ], 404);
        }

        // Check if has modifier items
        if ($modifierGroup->modifierItems()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Modifier Group tidak dapat dihapus karena masih memiliki modifier items'
            ], 400);
        }

        Cache::forget('admin_modifier_groups_all');
        $modifierGroup->delete();

        return response()->json([
            'success' => true,
            'message' => 'Modifier Group berhasil dihapus'
        ]);
    }
}
