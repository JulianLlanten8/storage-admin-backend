<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
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
            'name.required' => 'El nombre es requerido',
            'name.string' => 'El nombre debe ser una cadena de texto',
            'email.required' => 'El correo electrónico es requerido',
            'email.email' => 'El correo electrónico debe ser válido',
            'email.unique' => 'El correo electrónico ya está registrado',
            'password.required' => 'La contraseña es requerida',
            'password.min' => 'La contraseña debe tener al menos :min caracteres',
            'group_id.exists' => 'El grupo seleccionado no existe',
            'role.required' => 'El rol es requerido',
            'role.exists' => 'El rol seleccionado no existe',
        ];
    }
}
