<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInviteLinkRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $workspace = $user?->currentWorkspace;

        if (! $user || ! $workspace) {
            return false;
        }

        return $user->can('manageTeam', $workspace);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'role' => ['required', 'string', 'in:admin,member,viewer'],
            'max_uses' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'expires_in_days' => ['nullable', 'integer', 'min:1', 'max:90'],
        ];
    }
}
