<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkspaceCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->belongsToWorkspace($this->workspace);
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'min:1', 'max:5000'],
            'parent_id' => ['nullable', 'integer', 'exists:workspace_comments,id'],
            'commentable_type' => ['required', 'string', 'in:activity,announcement'],
            'commentable_id' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Please enter a comment.',
            'content.min' => 'Comment must be at least 1 character.',
            'content.max' => 'Comment cannot exceed 5000 characters.',
        ];
    }
}
