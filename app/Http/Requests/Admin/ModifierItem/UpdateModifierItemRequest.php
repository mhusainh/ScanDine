<?php

namespace App\Http\Requests\Admin\ModifierItem;

use Illuminate\Foundation\Http\FormRequest;

class UpdateModifierItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'is_available' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama modifier item harus diisi.',
            'name.max' => 'Nama modifier item maksimal 255 karakter.',
            'price.required' => 'Harga harus diisi.',
            'price.numeric' => 'Harga harus berupa angka.',
            'price.min' => 'Harga tidak boleh kurang dari 0.',
            'is_available.boolean' => 'Status tersedia harus berupa boolean.',
            'sort_order.integer' => 'Urutan harus berupa angka.',
            'sort_order.min' => 'Urutan tidak boleh kurang dari 0.',
        ];
    }
}
