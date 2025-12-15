<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModifierGroup;
use App\Http\Requests\Admin\ModifierGroup\StoreModifierGroupRequest;
use App\Http\Requests\Admin\ModifierGroup\UpdateModifierGroupRequest;

class ModifierGroupController extends Controller
{
    /**
     * Display all modifier groups
     */
    public function index()
    {
        $modifierGroups = ModifierGroup::withCount('modifierItems')
            ->orderBy('sort_order')
            ->paginate(20);

        return view('admin.modifier-groups.index', compact('modifierGroups'));
    }

    /**
     * Show create form
     */
    public function create()
    {
        return view('admin.modifier-groups.create');
    }

    /**
     * Store new modifier group
     */
    public function store(StoreModifierGroupRequest $request)
    {
        ModifierGroup::create([
            'name' => $request->name,
            'type' => $request->type,
            'min_selection' => $request->min_selection ?? 0,
            'max_selection' => $request->max_selection,
            'is_required' => $request->has('is_required') ? true : false,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return redirect()->route('admin.modifier-groups.index')
            ->with('success', 'Modifier Group berhasil ditambahkan.');
    }

    /**
     * Show modifier group detail
     */
    public function show($id)
    {
        $modifierGroup = ModifierGroup::with('modifierItems')->findOrFail($id);
        return view('admin.modifier-groups.show', compact('modifierGroup'));
    }

    /**
     * Show edit form
     */
    public function edit($id)
    {
        $modifierGroup = ModifierGroup::findOrFail($id);
        return view('admin.modifier-groups.edit', compact('modifierGroup'));
    }

    /**
     * Update modifier group
     */
    public function update(UpdateModifierGroupRequest $request, $id)
    {
        $modifierGroup = ModifierGroup::findOrFail($id);

        $modifierGroup->update([
            'name' => $request->name,
            'type' => $request->type,
            'min_selection' => $request->min_selection ?? 0,
            'max_selection' => $request->max_selection,
            'is_required' => $request->has('is_required') ? true : false,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return redirect()->route('admin.modifier-groups.index')
            ->with('success', 'Modifier Group berhasil diupdate.');
    }

    /**
     * Delete modifier group
     */
    public function destroy($id)
    {
        $modifierGroup = ModifierGroup::findOrFail($id);

        // Check if modifier group is used by menu items
        if ($modifierGroup->menuItems()->count() > 0) {
            return back()->with('error', 'Modifier Group tidak dapat dihapus karena masih digunakan oleh menu.');
        }

        // Check if has modifier items
        if ($modifierGroup->modifierItems()->count() > 0) {
            return back()->with('error', 'Modifier Group tidak dapat dihapus karena masih memiliki modifier items.');
        }

        $modifierGroup->delete();

        return redirect()->route('admin.modifier-groups.index')
            ->with('success', 'Modifier Group berhasil dihapus.');
    }
}
