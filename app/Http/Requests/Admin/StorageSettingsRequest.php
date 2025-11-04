<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorageSettingsRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function authorize(): bool
    {
        // Por defecto permitimos.si no reemplazar con algo asi por el estilo ($this->user()->can(...)).
        return true;
    }

    public function rules(): array
    {
        // Determinamos el método del controlador que invocó esta request
        $action = $this->route()?->getActionMethod();

        // Para setGlobal, setGroupQuota y setUserQuota usamos la misma regla.
        // para 'quota_mb'. Si en el futuro hay diferencias, añadir casos específicos.
        switch ($action) {
            case 'setGlobal':
            case 'setGroupQuota':
            case 'setUserQuota':
            default:
                return ['quota_mb' => 'required|integer|min:1'];
        }
    }

    /**
     * Mensajes personalizados en español.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'quota_mb.required' => 'El límite (quota_mb) es requerido',
            'quota_mb.integer' => 'El límite debe ser un número entero',
            'quota_mb.min' => 'El límite debe ser al menos :min',
        ];
    }
}
