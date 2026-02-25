<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\Workspace;

class WebhookEndpointPolicy
{
    /**
     * Verify if the user can interact with webhooks in the given workspace context.
     */
    protected function canManageWebhooks(User $user, Workspace $workspace): bool
    {
        // Ensure the user actually belongs to this workspace context requested
        if (! $user->belongsToWorkspace($workspace)) {
            return false;
        }

        return $workspace->hasPermission($user, 'manage_webhooks');
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Workspace $workspace): bool
    {
        return $this->canManageWebhooks($user, $workspace);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, WebhookEndpoint $webhookEndpoint): bool
    {
        return $this->canManageWebhooks($user, $webhookEndpoint->workspace);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Workspace $workspace): bool
    {
        return $this->canManageWebhooks($user, $workspace);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, WebhookEndpoint $webhookEndpoint): bool
    {
        return $this->canManageWebhooks($user, $webhookEndpoint->workspace);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, WebhookEndpoint $webhookEndpoint): bool
    {
        return $this->canManageWebhooks($user, $webhookEndpoint->workspace);
    }
}
