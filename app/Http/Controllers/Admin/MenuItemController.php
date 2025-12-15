<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\ModifierGroup;
use App\Http\Requests\Admin\MenuItem\StoreMenuItemRequest;
use App\Http\Requests\Admin\MenuItem\UpdateMenuItemRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuItemController extends Controller
{
    /**
     * Display all menu items
     */
    public function index(Request $request)
    {
        $query = MenuItem::with('category');

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

        $menuItems = $query->orderBy('sort_order')->paginate(20);
        $categories = Category::active()->ordered()->get();

        return view('admin.menu-items.index', compact('menuItems', 'categories'));
    }

    /**
     * Show create form
     */
    public function create()
    {
        $categories = Category::active()->ordered()->get();
        $modifierGroups = ModifierGroup::with('modifierItems')->ordered()->get();

        return view('admin.menu-items.create', compact('categories', 'modifierGroups'));
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
            'is_available' => $request->has('is_available') ? true : false,
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

        return redirect()->route('admin.menu-items.index')
            ->with('success', 'Menu berhasil ditambahkan.');
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

        return view('admin.menu-items.show', compact('menuItem'));
    }

    /**
     * Show edit form
     */
    public function edit($id)
    {
        $menuItem = MenuItem::with('modifierGroups')->findOrFail($id);
        $categories = Category::active()->ordered()->get();
        $modifierGroups = ModifierGroup::with('modifierItems')->ordered()->get();

        return view('admin.menu-items.edit', compact('menuItem', 'categories', 'modifierGroups'));
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
            'is_available' => $request->has('is_available') ? true : false,
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

        return redirect()->route('admin.menu-items.index')
            ->with('success', 'Menu berhasil diupdate.');
    }

    /**
     * Delete menu item
     */
    public function destroy($id)
    {
        $menuItem = MenuItem::findOrFail($id);

        // Delete image from Cloudinary
        if ($menuItem->public_id) {
            cloudinary()->uploadApi()->destroy($menuItem->public_id);
        }

        // Detach modifier groups
        $menuItem->modifierGroups()->detach();

        $menuItem->delete();

        return redirect()->route('admin.menu-items.index')
            ->with('success', 'Menu berhasil dihapus.');
    }

    /**
     * Toggle available status
     */
    public function toggleAvailable($id)
    {
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->update(['is_available' => !$menuItem->is_available]);

        $status = $menuItem->is_available ? 'tersedia' : 'tidak tersedia';

        return back()->with('success', "Menu berhasil diubah menjadi {$status}.");
    }

    /**
     * Delete image
     */
    public function deleteImage($id)
    {
        $menuItem = MenuItem::findOrFail($id);

        if ($menuItem->public_id) {
            cloudinary()->uploadApi()->destroy($menuItem->public_id);

            $menuItem->update([
                'public_id' => null,
                'url_file' => null,
            ]);

            return back()->with('success', 'Gambar berhasil dihapus.');
        }

        return back()->with('error', 'Tidak ada gambar untuk dihapus.');
    }
}
