<?php

namespace App\Http\Controllers\Api\Admin;

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
        $query = MenuItem::with(['category']); // Removed modifierGroups for performance

        // Filter by category
        if ($request->has('category_id') && $request->category_id != '') {
            $query->where('category_id', $request->category_id);
        }

        // Filter by availability
        if ($request->has('is_available') && $request->is_available != '') {
            $query->where('is_available', $request->is_available);
        }

        // Search
        if ($request->has('search') && $request->search != '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $perPage = $request->input('per_page', 20);
        $menuItems = $query->orderBy('sort_order')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $menuItems
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
            'is_available' => $request->boolean('is_available'),
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

        // Attach modifier groups
        if ($request->has('modifier_groups')) {
            $menuItem->modifierGroups()->sync($request->modifier_groups);
        }

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil ditambahkan',
            'data' => $menuItem->load('category', 'modifierGroups')
        ], 201);
    }

    /**
     * Show menu item detail
     */
    public function show($id)
    {
        $menuItem = MenuItem::with([
            'category',
            'modifierGroups.modifierItems'
        ])->find($id);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $menuItem
        ]);
    }

    /**
     * Update menu item
     */
    public function update(UpdateMenuItemRequest $request, $id)
    {
        $menuItem = MenuItem::find($id);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        $data = [
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'sort_order' => $request->sort_order ?? 0,
            'is_available' => $request->boolean('is_available'),
        ];

        // Upload new image to Cloudinary
        if ($request->hasFile('image')) {
            // Delete old image if exists
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

        // Sync modifier groups
        if ($request->has('modifier_groups')) {
            $menuItem->modifierGroups()->sync($request->modifier_groups);
        } else {
            $menuItem->modifierGroups()->sync([]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil diupdate',
            'data' => $menuItem->fresh(['category', 'modifierGroups'])
        ]);
    }

    /**
     * Delete menu item
     */
    public function destroy($id)
    {
        $menuItem = MenuItem::find($id);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        // Delete image from Cloudinary
        if ($menuItem->public_id) {
            cloudinary()->uploadApi()->destroy($menuItem->public_id);
        }

        // Detach modifier groups
        $menuItem->modifierGroups()->detach();

        $menuItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dihapus'
        ]);
    }

    /**
     * Toggle available status
     */
    public function toggleAvailable($id)
    {
        $menuItem = MenuItem::find($id);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        $menuItem->update(['is_available' => !$menuItem->is_available]);

        $status = $menuItem->is_available ? 'tersedia' : 'tidak tersedia';

        return response()->json([
            'success' => true,
            'message' => "Menu berhasil diubah menjadi {$status}",
            'data' => $menuItem
        ]);
    }

    /**
     * Delete image
     */
    public function deleteImage($id)
    {
        $menuItem = MenuItem::find($id);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan'
            ], 404);
        }

        if ($menuItem->public_id) {
            cloudinary()->uploadApi()->destroy($menuItem->public_id);

            $menuItem->update([
                'public_id' => null,
                'url_file' => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Gambar berhasil dihapus',
                'data' => $menuItem
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Tidak ada gambar untuk dihapus'
        ], 400);
    }
}
