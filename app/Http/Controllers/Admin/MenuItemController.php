<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\ModifierGroup;
use App\Http\Requests\Admin\MenuItem\StoreMenuItemRequest;
use App\Http\Requests\Admin\MenuItem\UpdateMenuItemRequest;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    /**
     * Display all menu items
     */
    public function index(Request $request)
    {
        $query = MenuItem::with(['category', 'modifierGroups']);

        // Filter by category
        if ($request->has('category_id') && $request->category_id != '') {
            $query->where('category_id', $request->category_id);
        }

        // Search
        if ($request->has('search') && $request->search != '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $menuItems = $query->orderBy('sort_order')->paginate(20);
        $categories = Category::active()->ordered()->get();

        // For API response
        return response()->json([
            'menuItems' => $menuItems,
            'categories' => $categories
        ]);
    }

    /**
     * Store new menu item
     */
    public function store(StoreMenuItemRequest $request)
    {
        $data = [
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'sort_order' => $request->sort_order ?? 0,
            'is_available' => $request->has('is_available') ? filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN) : false,
        ];

        // Upload image to Cloudinary
        if ($request->hasFile('image')) {
            $uploadedFile = cloudinary()->uploadApi()->upload($request->file('image')->getRealPath(), [
                'folder' => 'scandine/menu-items',
                'transformation' => [
                    'width' => 800,
                    'height' => 800,
                    'crop' => 'limit'
                ]
            ]);

            $data['public_id'] = $uploadedFile['public_id'];
            $data['url_file'] = $uploadedFile['secure_url'];
        }

        $menuItem = MenuItem::create($data);

        if ($request->has('modifier_groups')) {
             // Expecting comma separated IDs or array if coming from JSON
             $groups = is_string($request->modifier_groups) ? explode(',', $request->modifier_groups) : $request->modifier_groups;
            $menuItem->modifierGroups()->sync($groups);
        }

        return response()->json([
            'success' => true,
            'message' => 'Menu created successfully',
            'data' => $menuItem
        ]);
    }

    /**
     * Show menu item detail
     */
    public function show($id)
    {
        $menuItem = MenuItem::with([
            'category',
            'modifierGroups.modifierItems'
        ])->findOrFail($id);

        return response()->json($menuItem);
    }

    /**
     * Update menu item
     */
    public function update(UpdateMenuItemRequest $request, $id)
    {
        $menuItem = MenuItem::findOrFail($id);

        $data = [
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'sort_order' => $request->sort_order ?? 0,
            'is_available' => $request->has('is_available') ? filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN) : false,
        ];

        if ($request->hasFile('image')) {
            if ($menuItem->public_id) {
                cloudinary()->uploadApi()->destroy($menuItem->public_id);
            }

            $uploadedFile = cloudinary()->uploadApi()->upload($request->file('image')->getRealPath(), [
                'folder' => 'scandine/menu-items',
                'transformation' => [
                    'width' => 800,
                    'height' => 800,
                    'crop' => 'limit'
                ]
            ]);

            $data['public_id'] = $uploadedFile['public_id'];
            $data['url_file'] = $uploadedFile['secure_url'];
        }

        $menuItem->update($data);

        if ($request->has('modifier_groups')) {
            $groups = is_string($request->modifier_groups) ? explode(',', $request->modifier_groups) : $request->modifier_groups;
            $menuItem->modifierGroups()->sync($groups);
        }

        return response()->json([
            'success' => true,
            'message' => 'Menu updated successfully',
            'data' => $menuItem
        ]);
    }

    /**
     * Delete menu item
     */
    public function destroy($id)
    {
        $menuItem = MenuItem::findOrFail($id);

        if ($menuItem->public_id) {
            cloudinary()->uploadApi()->destroy($menuItem->public_id);
        }

        $menuItem->modifierGroups()->detach();
        $menuItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu deleted successfully'
        ]);
    }

    /**
     * Toggle available status
     */
    public function toggleAvailable($id)
    {
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->update(['is_available' => !$menuItem->is_available]);

        return response()->json([
            'success' => true,
            'message' => 'Availability toggled',
            'is_available' => $menuItem->is_available
        ]);
    }
}
