<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AssignRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        $rules = [];

        // Reglas para asignación de grupo
        if ($this->is('api/admin/users/*/assign-group')) {
            $rules = [
                'group_id' => 'required|exists:groups,id',
            ];
        }

        // Reglas para asignación de rol
        if ($this->is('api/admin/users/*/assign-role')) {
            $rules = [
                'role' => 'required|string|exists:roles,name',
            ];
        }

        return $rules;
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'group_id.required' => 'El grupo es requerido',
            'group_id.exists' => 'El grupo seleccionado no existe',
            'role.required' => 'El rol es requerido',
            'role.exists' => 'El rol seleccionado no existe',
        ];
    }
}
