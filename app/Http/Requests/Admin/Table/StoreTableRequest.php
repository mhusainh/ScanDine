<?php

namespace App\Http\Requests\Admin\Table;

use Illuminate\Foundation\Http\FormRequest;

class StoreTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'table_number' => 'required|string|unique:tables,table_number',
        ];
    }

    public function messages(): array
    {
        return [
            'table_number.required' => 'Nomor meja harus diisi.',
            'table_number.string' => 'Nomor meja harus berupa teks.',
            'table_number.unique' => 'Nomor meja sudah digunakan.',
        ];
    }
}
