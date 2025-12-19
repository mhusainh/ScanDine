<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModifierItem;
use App\Models\ModifierGroup;
use App\Http\Requests\Admin\ModifierItem\StoreModifierItemRequest;
use App\Http\Requests\Admin\ModifierItem\UpdateModifierItemRequest;
use Illuminate\Http\Request;

class ModifierItemController extends Controller
{
    /**
     * Display all modifier items by group
     */
    public function index($modifierGroupId)
    {
        $modifierGroup = ModifierGroup::find($modifierGroupId);

        if (!$modifierGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Modifier Group tidak ditemukan'
            ], 404);
        }

        $modifierItems = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'modifier_group' => $modifierGroup,
                'modifier_items' => $modifierItems
            ]
        ]);
    }

    /**
     * Store new modifier item
     */
    public function store(StoreModifierItemRequest $request, $modifierGroupId)
    {
        $modifierGroup = ModifierGroup::find($modifierGroupId);

        if (!$modifierGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Modifier Group tidak ditemukan'
            ], 404);
        }

        $modifierItem = ModifierItem::create([
            'modifier_group_id' => $modifierGroupId,
            'name' => $request->name,
            'price' => $request->price,
            'is_available' => $request->has('is_available') ? true : false,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Modifier Item berhasil ditambahkan',
            'data' => $modifierItem
        ], 201);
    }

    /**
     * Show modifier item detail
     */
    public function show($modifierGroupId, $id)
    {
        $modifierItem = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->find($id);

        if (!$modifierItem) {
            return response()->json([
                'success' => false,
                'message' => 'Modifier Item tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $modifierItem
        ]);
    }

    /**
     * Update modifier item
     */
    public function update(UpdateModifierItemRequest $request, $modifierGroupId, $id)
    {
        $modifierItem = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->find($id);

        if (!$modifierItem) {
            return response()->json([
                'success' => false,
                'message' => 'Modifier Item tidak ditemukan'
            ], 404);
        }

        $modifierItem->update([
            'name' => $request->name,
            'price' => $request->price,
            'is_available' => $request->has('is_available') ? true : false,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Modifier Item berhasil diupdate',
            'data' => $modifierItem
        ]);
    }

    /**
     * Delete modifier item
     */
    public function destroy($modifierGroupId, $id)
    {
        $modifierItem = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->find($id);

        if (!$modifierItem) {
            return response()->json([
                'success' => false,
                'message' => 'Modifier Item tidak ditemukan'
            ], 404);
        }

        $modifierItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Modifier Item berhasil dihapus'
        ]);
    }

    /**
     * Toggle available status
     */
    public function toggleAvailable($modifierGroupId, $id)
    {
        $modifierItem = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->find($id);

        if (!$modifierItem) {
            return response()->json([
                'success' => false,
                'message' => 'Modifier Item tidak ditemukan'
            ], 404);
        }

        $modifierItem->update(['is_available' => !$modifierItem->is_available]);

        $status = $modifierItem->is_available ? 'tersedia' : 'tidak tersedia';

        return response()->json([
            'success' => true,
            'message' => "Modifier Item berhasil diubah menjadi {$status}",
            'data' => $modifierItem
        ]);
    }
}
