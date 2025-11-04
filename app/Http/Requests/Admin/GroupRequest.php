<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GroupRequest extends FormRequest
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
        return [];

        if ($this->isMethod('post')) {
            return [
                'name' => 'required|string|unique:groups,name',
                'quota_mb' => 'nullable|integer|min:1',
            ];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            return [
                'name' => 'sometimes|string|unique:groups,name,'.$this->group?->id,
                'quota_mb' => 'nullable|integer|min:1',
            ];
        }
    }
}
