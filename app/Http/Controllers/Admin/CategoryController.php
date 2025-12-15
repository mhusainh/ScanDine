<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Requests\Admin\Category\StoreCategoryRequest;
use App\Http\Requests\Admin\Category\UpdateCategoryRequest;

class CategoryController extends Controller
{
    /**
     * Display all categories
     */
    public function index()
    {
        $categories = Category::withCount('menuItems')
            ->orderBy('sort_order')
            ->paginate(20);

        return view('admin.categories.index', compact('categories'));
    }

    /**
     * Show create form
     */
    public function create()
    {
        return view('admin.categories.create');
    }

    /**
     * Store new category
     */
    public function store(StoreCategoryRequest $request)
    {
        Category::create([
            'name' => $request->name,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->has('is_active') ? true : false,
        ]);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    /**
     * Show edit form
     */
    public function edit($id)
    {
        $category = Category::findOrFail($id);
        return view('admin.categories.edit', compact('category'));
    }

    /**
     * Update category
     */
    public function update(UpdateCategoryRequest $request, $id)
    {
        $category = Category::findOrFail($id);

        $category->update([
            'name' => $request->name,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->has('is_active') ? true : false,
        ]);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategori berhasil diupdate.');
    }

    /**
     * Delete category
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Check if category has menu items
        if ($category->menuItems()->count() > 0) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih memiliki menu.');
        }

        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }

    /**
     * Toggle active status
     */
    public function toggleActive($id)
    {
        $category = Category::findOrFail($id);
        $category->update(['is_active' => !$category->is_active]);

        $status = $category->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Kategori berhasil {$status}.");
    }
}
