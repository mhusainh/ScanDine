<?php

namespace App\Http\Requests\Admin\Table;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tableId = $this->route('table');

        return [
            'table_number' => 'required|string|unique:tables,table_number,' . $tableId,
            'status' => 'required|in:available,occupied,reserved',
        ];
    }

    public function messages(): array
    {
        return [
            'table_number.required' => 'Nomor meja harus diisi.',
            'table_number.string' => 'Nomor meja harus berupa teks.',
            'table_number.unique' => 'Nomor meja sudah digunakan.',
            'status.required' => 'Status harus dipilih.',
            'status.in' => 'Status harus available, occupied, atau reserved.',
        ];
    }
}
