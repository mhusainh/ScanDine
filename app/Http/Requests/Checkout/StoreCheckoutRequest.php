<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class StoreCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'table_uuid' => 'required|exists:tables,uuid',
            'customer_name' => 'nullable|string|max:255',
            'payment_method' => 'required|in:online,cash',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string',
            'items.*.modifiers' => 'nullable|array',
            'items.*.modifiers.*.modifier_item_id' => 'required|exists:modifier_items,id',
            'items.*.modifiers.*.price' => 'required|numeric|min:0',
            'items.*.modifiers.*.quantity' => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'table_uuid.required' => 'Table UUID harus ada.',
            'table_uuid.exists' => 'Table tidak ditemukan.',
            'customer_name.max' => 'Nama customer maksimal 255 karakter.',
            'payment_method.required' => 'Metode pembayaran harus dipilih.',
            'payment_method.in' => 'Metode pembayaran harus online atau cash.',
            'items.required' => 'Items harus diisi.',
            'items.array' => 'Items harus berupa array.',
            'items.min' => 'Minimal 1 item harus dipesan.',
            'items.*.menu_item_id.required' => 'Menu item ID harus ada.',
            'items.*.menu_item_id.exists' => 'Menu item tidak ditemukan.',
            'items.*.quantity.required' => 'Quantity harus diisi.',
            'items.*.quantity.integer' => 'Quantity harus berupa angka.',
            'items.*.quantity.min' => 'Quantity minimal 1.',
            'items.*.price.required' => 'Harga harus diisi.',
            'items.*.price.numeric' => 'Harga harus berupa angka.',
            'items.*.price.min' => 'Harga tidak boleh kurang dari 0.',
            'items.*.modifiers.*.modifier_item_id.required' => 'Modifier item ID harus ada.',
            'items.*.modifiers.*.modifier_item_id.exists' => 'Modifier item tidak ditemukan.',
            'items.*.modifiers.*.price.required' => 'Harga modifier harus diisi.',
            'items.*.modifiers.*.price.numeric' => 'Harga modifier harus berupa angka.',
            'items.*.modifiers.*.quantity.required' => 'Quantity modifier harus diisi.',
            'items.*.modifiers.*.quantity.min' => 'Quantity modifier minimal 1.',
        ];
    }
}
