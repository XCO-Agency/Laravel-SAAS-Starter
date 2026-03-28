<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WorkspaceComment;

class WorkspaceCommentPolicy
{
    public function view(User $user, WorkspaceComment $comment): bool
    {
        return $user->belongsToWorkspace($comment->workspace);
    }

    public function create(User $user): bool
    {
        // Any workspace member can create comments
        return true;
    }

    public function update(User $user, WorkspaceComment $comment): bool
    {
        // Users can only edit their own comments
        return $user->id === $comment->user_id;
    }

    public function delete(User $user, WorkspaceComment $comment): bool
    {
        // Users can delete their own comments
        // Workspace admins can delete any comment
        if ($user->id === $comment->user_id) {
            return true;
        }

        return $user->ownsWorkspace($comment->workspace) ||
            ($user->belongsToWorkspace($comment->workspace) &&
             $user->workspaceRole($comment->workspace)?->hasPermission('manage_team'));
    }

    public function reply(User $user, WorkspaceComment $comment): bool
    {
        return $user->belongsToWorkspace($comment->workspace);
    }
}
