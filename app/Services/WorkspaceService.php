<?php

namespace App\Services;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Str;

class WorkspaceService
{
    /**
     * Create a new workspace for a user.
     */
    public function create(User $user, array $data, bool $personal = false): Workspace
    {
        $workspace = Workspace::create([
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Workspace::generateUniqueSlug($data['name']),
            'logo' => $data['logo'] ?? null,
            'owner_id' => $user->id,
            'personal_workspace' => $personal,
        ]);

        // Add the owner as a member with 'owner' role
        $workspace->users()->attach($user->id, ['role' => 'owner']);

        // If user has no current workspace, set this one
        if (! $user->current_workspace_id) {
            $user->switchWorkspace($workspace);
        }

        return $workspace;
    }

    /**
     * Create a personal workspace for a new user.
     */
    public function createPersonalWorkspace(User $user): Workspace
    {
        return $this->create($user, [
            'name' => $user->name."'s Workspace",
        ], true);
    }

    /**
     * Update a workspace.
     */
    public function update(Workspace $workspace, array $data): Workspace
    {
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }

        if (isset($data['slug']) && $data['slug'] !== $workspace->slug) {
            // Validate unique slug
            if (Workspace::where('slug', $data['slug'])->where('id', '!=', $workspace->id)->exists()) {
                throw new \InvalidArgumentException('The slug has already been taken.');
            }
            $updateData['slug'] = Str::slug($data['slug']);
        }

        if (array_key_exists('logo', $data)) {
            $updateData['logo'] = $data['logo'];
        }

        $workspace->update($updateData);

        return $workspace->fresh();
    }

    /**
     * Delete a workspace.
     */
    public function delete(Workspace $workspace): bool
    {
        // Cannot delete personal workspace
        if ($workspace->personal_workspace) {
            throw new \InvalidArgumentException('Cannot delete your personal workspace.');
        }

        // Move all users' current workspace to their personal workspace if needed
        foreach ($workspace->users as $user) {
            if ($user->current_workspace_id === $workspace->id) {
                $personalWorkspace = $user->personalWorkspace();
                if ($personalWorkspace) {
                    $user->switchWorkspace($personalWorkspace);
                }
            }
        }

        return $workspace->delete();
    }

    /**
     * Transfer workspace ownership to another user.
     */
    public function transferOwnership(Workspace $workspace, User $newOwner): Workspace
    {
        // Ensure new owner is a member of the workspace
        if (! $workspace->hasUser($newOwner)) {
            throw new \InvalidArgumentException('The new owner must be a member of the workspace.');
        }

        // Get current owner
        $currentOwner = $workspace->owner;

        // Update workspace owner
        $workspace->update(['owner_id' => $newOwner->id]);

        // Update roles
        $workspace->updateUserRole($newOwner, 'owner');
        $workspace->updateUserRole($currentOwner, 'admin');

        return $workspace->fresh();
    }

    /**
     * Check if a user can create more workspaces based on their plan.
     */
    public function canCreateWorkspace(User $user): bool
    {
        $config = config('billing.plans');
        $ownedWorkspaces = $user->ownedWorkspaces()->count();

        // Get the user's best plan (from any workspace they own)
        $maxWorkspaces = $config['free']['limits']['workspaces'];

        foreach ($user->ownedWorkspaces as $workspace) {
            if ($workspace->onBusinessPlan()) {
                return true; // Unlimited workspaces
            }

            if ($workspace->onProPlan()) {
                $maxWorkspaces = max($maxWorkspaces, $config['pro']['limits']['workspaces']);
            }
        }

        return $ownedWorkspaces < $maxWorkspaces;
    }

    /**
     * Get the workspace limit message for the user.
     */
    public function getWorkspaceLimitMessage(User $user): string
    {
        $config = config('billing.plans');
        $ownedWorkspaces = $user->ownedWorkspaces()->count();

        // Find the highest plan
        $currentPlan = 'Free';
        $limit = $config['free']['limits']['workspaces'];

        foreach ($user->ownedWorkspaces as $workspace) {
            if ($workspace->onBusinessPlan()) {
                return 'You have unlimited workspaces on the Business plan.';
            }

            if ($workspace->onProPlan()) {
                $currentPlan = 'Pro';
                $limit = $config['pro']['limits']['workspaces'];
            }
        }

        return "You have created {$ownedWorkspaces} of {$limit} workspaces on the {$currentPlan} plan.";
    }
}
