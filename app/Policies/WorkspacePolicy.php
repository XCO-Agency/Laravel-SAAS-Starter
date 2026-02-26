<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;

class WorkspacePolicy
{
    /**
     * Determine whether the user can manage the workspace's billing.
     */
    public function manageBilling(User $user, Workspace $workspace): bool
    {
        return $workspace->hasPermission($user, 'manage_billing');
    }

    /**
     * Determine whether the user can manage the workspace's webhooks.
     */
    public function manageWebhooks(User $user, Workspace $workspace): bool
    {
        return $workspace->hasPermission($user, 'manage_webhooks');
    }

    /**
     * Determine whether the user can view the workspace's activity logs.
     */
    public function viewActivityLogging(User $user, Workspace $workspace): bool
    {
        return $workspace->hasPermission($user, 'view_activity_logs');
    }

    /**
     * Determine whether the user can invite, remove, or update members (Team Management).
     */
    public function manageTeam(User $user, Workspace $workspace): bool
    {
        return $workspace->hasPermission($user, 'manage_team');
    }

    /**
     * Determine whether the user can update the workspace settings.
     */
    public function update(User $user, Workspace $workspace): bool
    {
        return $workspace->userIsAdmin($user);
    }

    /**
     * Determine whether the user can delete the workspace entirely.
     * Hardcoded to Owner only for extreme safety.
     */
    public function delete(User $user, Workspace $workspace): bool
    {
        return $workspace->userIsOwner($user);
    }
}
