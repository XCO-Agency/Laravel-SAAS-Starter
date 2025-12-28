<?php

namespace App\Services;

use App\Models\User;
use App\Models\Workspace;

class PlanLimitService
{
    /**
     * Get the limits for a given plan.
     */
    public function getLimits(string $plan): array
    {
        $plans = config('billing.plans');

        return $plans[strtolower($plan)]['limits'] ?? [
            'workspaces' => 1,
            'team_members' => 1,
        ];
    }

    /**
     * Check if a user can create more workspaces.
     */
    public function canCreateWorkspace(User $user): bool
    {
        // Count the workspaces where the user is the owner
        $ownedWorkspacesCount = $user->ownedWorkspaces()->count();

        // Get the highest plan limits among all workspaces the user owns
        $maxWorkspaces = $this->getMaxWorkspacesForUser($user);

        return $ownedWorkspacesCount < $maxWorkspaces;
    }

    /**
     * Get the maximum number of workspaces a user can create based on their highest plan.
     */
    public function getMaxWorkspacesForUser(User $user): int
    {
        $workspaces = $user->ownedWorkspaces;

        if ($workspaces->isEmpty()) {
            return 1; // Free plan default
        }

        $maxWorkspaces = 1;
        foreach ($workspaces as $workspace) {
            $limits = $this->getLimits($workspace->plan_name);
            $maxWorkspaces = max($maxWorkspaces, $limits['workspaces']);
        }

        return $maxWorkspaces;
    }

    /**
     * Check if a workspace can invite more team members.
     */
    public function canInviteTeamMember(Workspace $workspace): bool
    {
        $limits = $this->getLimits($workspace->plan_name);
        $currentMembersCount = $workspace->members()->count();
        $pendingInvitationsCount = $workspace->invitations()->count();

        return ($currentMembersCount + $pendingInvitationsCount) < $limits['team_members'];
    }

    /**
     * Get the remaining team member slots for a workspace.
     */
    public function getRemainingTeamMemberSlots(Workspace $workspace): int
    {
        $limits = $this->getLimits($workspace->plan_name);
        $currentMembersCount = $workspace->members()->count();
        $pendingInvitationsCount = $workspace->invitations()->count();

        return max(0, $limits['team_members'] - $currentMembersCount - $pendingInvitationsCount);
    }

    /**
     * Get a human-readable message about workspace limits.
     */
    public function getWorkspaceLimitMessage(User $user): string
    {
        $ownedWorkspacesCount = $user->ownedWorkspaces()->count();
        $maxWorkspaces = $this->getMaxWorkspacesForUser($user);
        $remaining = max(0, $maxWorkspaces - $ownedWorkspacesCount);

        if ($remaining === 0) {
            return 'You have reached your workspace limit. Upgrade your plan to create more workspaces.';
        }

        if ($maxWorkspaces >= 999) {
            return 'You have unlimited workspaces available.';
        }

        return "You can create {$remaining} more workspace(s). ({$ownedWorkspacesCount}/{$maxWorkspaces} used)";
    }

    /**
     * Get a human-readable message about team member limits.
     */
    public function getTeamMemberLimitMessage(Workspace $workspace): string
    {
        $limits = $this->getLimits($workspace->plan_name);
        $currentMembersCount = $workspace->members()->count();
        $pendingInvitationsCount = $workspace->invitations()->count();
        $total = $currentMembersCount + $pendingInvitationsCount;
        $remaining = max(0, $limits['team_members'] - $total);

        if ($limits['team_members'] >= 999) {
            return 'You have unlimited team member slots available.';
        }

        if ($remaining === 0) {
            return 'You have reached your team member limit. Upgrade your plan to invite more members.';
        }

        return "You can invite {$remaining} more team member(s). ({$currentMembersCount}/{$limits['team_members']} members)";
    }
}
