<?php

namespace App\Http\Requests\Admin\MenuItem;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'sort_order' => 'nullable|integer|min:0',
            'is_available' => 'nullable|boolean',
            'modifier_groups' => 'nullable|array',
            'modifier_groups.*' => 'exists:modifier_groups,id',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori harus dipilih.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'name.required' => 'Nama menu harus diisi.',
            'name.max' => 'Nama menu maksimal 255 karakter.',
            'price.required' => 'Harga harus diisi.',
            'price.numeric' => 'Harga harus berupa angka.',
            'price.min' => 'Harga tidak boleh kurang dari 0.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Gambar harus berformat jpeg, png, atau jpg.',
            'image.max' => 'Ukuran gambar maksimal 2MB.',
            'sort_order.integer' => 'Urutan harus berupa angka.',
            'sort_order.min' => 'Urutan tidak boleh kurang dari 0.',
            'modifier_groups.array' => 'Modifier groups harus berupa array.',
            'modifier_groups.*.exists' => 'Modifier group yang dipilih tidak valid.',
        ];
    }
}
