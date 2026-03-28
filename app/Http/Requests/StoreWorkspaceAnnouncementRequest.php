<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkspaceAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        $workspace = $this->route('workspace');
        $user = $this->user();

        // Only workspace admins and owners can manage announcements
        return $user->ownsWorkspace($workspace) || $user->userIsAdmin($workspace);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'content' => ['required', 'string', 'min:10', 'max:10000'],
            'type' => ['required', 'string', 'in:info,warning,success'],
            'pinned' => ['boolean'],
            'dismissible' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:published_at'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Please enter an announcement title.',
            'title.min' => 'Title must be at least 3 characters.',
            'content.required' => 'Please enter announcement content.',
            'content.min' => 'Content must be at least 10 characters.',
            'expires_at.after_or_equal' => 'Expiry date must be after or equal to the publish date.',
        ];
    }
}
