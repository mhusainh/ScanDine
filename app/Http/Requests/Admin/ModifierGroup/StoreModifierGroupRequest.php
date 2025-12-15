<?php

namespace App\Http\Requests\Admin\ModifierGroup;

use Illuminate\Foundation\Http\FormRequest;

class StoreModifierGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'required|in:single_choice,multiple_choice',
            'min_selection' => 'nullable|integer|min:0',
            'max_selection' => 'nullable|integer|min:0',
            'is_required' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama modifier group harus diisi.',
            'name.max' => 'Nama modifier group maksimal 255 karakter.',
            'type.required' => 'Tipe harus dipilih.',
            'type.in' => 'Tipe harus single_choice atau multiple_choice.',
            'min_selection.integer' => 'Minimum seleksi harus berupa angka.',
            'min_selection.min' => 'Minimum seleksi tidak boleh kurang dari 0.',
            'max_selection.integer' => 'Maksimum seleksi harus berupa angka.',
            'max_selection.min' => 'Maksimum seleksi tidak boleh kurang dari 0.',
            'is_required.boolean' => 'Status required harus berupa boolean.',
            'sort_order.integer' => 'Urutan harus berupa angka.',
            'sort_order.min' => 'Urutan tidak boleh kurang dari 0.',
        ];
    }
}
