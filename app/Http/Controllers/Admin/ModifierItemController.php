<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModifierGroup;
use App\Models\ModifierItem;
use App\Http\Requests\Admin\ModifierItem\StoreModifierItemRequest;
use App\Http\Requests\Admin\ModifierItem\UpdateModifierItemRequest;

class ModifierItemController extends Controller
{
    /**
     * Display modifier items by group
     */
    public function index($modifierGroupId)
    {
        $modifierGroup = ModifierGroup::findOrFail($modifierGroupId);
        $modifierItems = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->orderBy('sort_order')
            ->paginate(20);

        return view('admin.modifier-items.index', compact('modifierGroup', 'modifierItems'));
    }

    /**
     * Show create form
     */
    public function create($modifierGroupId)
    {
        $modifierGroup = ModifierGroup::findOrFail($modifierGroupId);
        return view('admin.modifier-items.create', compact('modifierGroup'));
    }

    /**
     * Store new modifier item
     */
    public function store(StoreModifierItemRequest $request, $modifierGroupId)
    {
        $modifierGroup = ModifierGroup::findOrFail($modifierGroupId);

        ModifierItem::create([
            'modifier_group_id' => $modifierGroupId,
            'name' => $request->name,
            'price' => $request->price,
            'is_available' => $request->has('is_available') ? true : false,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return redirect()->route('admin.modifier-items.index', $modifierGroupId)
            ->with('success', 'Modifier Item berhasil ditambahkan.');
    }

    /**
     * Show edit form
     */
    public function edit($modifierGroupId, $id)
    {
        $modifierGroup = ModifierGroup::findOrFail($modifierGroupId);
        $modifierItem = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->findOrFail($id);

        return view('admin.modifier-items.edit', compact('modifierGroup', 'modifierItem'));
    }

    /**
     * Update modifier item
     */
    public function update(UpdateModifierItemRequest $request, $modifierGroupId, $id)
    {
        $modifierItem = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->findOrFail($id);

        $modifierItem->update([
            'name' => $request->name,
            'price' => $request->price,
            'is_available' => $request->has('is_available') ? true : false,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return redirect()->route('admin.modifier-items.index', $modifierGroupId)
            ->with('success', 'Modifier Item berhasil diupdate.');
    }

    /**
     * Delete modifier item
     */
    public function destroy($modifierGroupId, $id)
    {
        $modifierItem = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->findOrFail($id);

        $modifierItem->delete();

        return redirect()->route('admin.modifier-items.index', $modifierGroupId)
            ->with('success', 'Modifier Item berhasil dihapus.');
    }

    /**
     * Toggle available status
     */
    public function toggleAvailable($modifierGroupId, $id)
    {
        $modifierItem = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->findOrFail($id);

        $modifierItem->update(['is_available' => !$modifierItem->is_available]);

        $status = $modifierItem->is_available ? 'tersedia' : 'tidak tersedia';

        return back()->with('success', "Modifier Item berhasil diubah menjadi {$status}.");
    }

    /**
     * API: Get modifier items by group
     */
    public function apiIndex($modifierGroupId)
    {
        $modifierItems = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->orderBy('sort_order')
            ->get();
        return response()->json($modifierItems);
    }

    /**
     * API: Store new modifier item
     */
    public function apiStore(StoreModifierItemRequest $request, $modifierGroupId)
    {
        // Validation handled by FormRequest
        
        $modifierItem = ModifierItem::create([
            'modifier_group_id' => $modifierGroupId,
            'name' => $request->name,
            'price' => $request->price,
            'is_available' => $request->has('is_available') ? true : false,
            'sort_order' => $request->sort_order ?? 0,
        ]);
        return response()->json($modifierItem);
    }

    /**
     * API: Update modifier item
     */
    public function apiUpdate(UpdateModifierItemRequest $request, $modifierGroupId, $id)
    {
        $modifierItem = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->findOrFail($id);

        $modifierItem->update([
            'name' => $request->name,
            'price' => $request->price,
            'is_available' => $request->has('is_available') ? true : false,
            'sort_order' => $request->sort_order ?? 0,
        ]);
        return response()->json($modifierItem);
    }

    /**
     * API: Delete modifier item
     */
    public function apiDestroy($modifierGroupId, $id)
    {
        $modifierItem = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->findOrFail($id);

        $modifierItem->delete();
        return response()->json(['message' => 'Modifier Item deleted']);
    }

    /**
     * API: Toggle available status
     */
    public function apiToggleAvailable($modifierGroupId, $id)
    {
        $modifierItem = ModifierItem::where('modifier_group_id', $modifierGroupId)
            ->findOrFail($id);

        $modifierItem->update(['is_available' => !$modifierItem->is_available]);
        return response()->json($modifierItem);
    }
}
