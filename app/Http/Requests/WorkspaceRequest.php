<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WorkspaceRequest extends FormRequest
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
        $workspaceId = $this->user()?->currentWorkspace?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('workspaces', 'slug')->ignore($workspaceId),
            ],
            'logo' => ['nullable', 'sometimes', 'image', 'max:2048'], // 2MB max
            'remove_logo' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Remove logo from validation if it's empty (not a file)
        if ($this->has('logo') && ! $this->hasFile('logo')) {
            $this->request->remove('logo');
            $this->files->remove('logo');
        }
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please enter a workspace name.',
            'slug.unique' => 'This URL slug is already taken.',
            'slug.alpha_dash' => 'The URL slug may only contain letters, numbers, dashes, and underscores.',
            'logo.image' => 'The logo must be an image file.',
            'logo.max' => 'The logo must not exceed 2MB.',
        ];
    }
}
