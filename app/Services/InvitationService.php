<?php

namespace App\Services;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Notifications\TeamInvitationNotification;
use Illuminate\Support\Facades\Notification;

class InvitationService
{
    /**
     * Send an invitation to join a workspace.
     */
    public function invite(Workspace $workspace, string $email, string $role = 'member'): WorkspaceInvitation
    {
        // Check if user is already a member
        $existingUser = User::where('email', $email)->first();
        if ($existingUser && $workspace->hasUser($existingUser)) {
            throw new \InvalidArgumentException('This user is already a member of the workspace.');
        }

        // Check for existing pending invitation
        $existingInvitation = WorkspaceInvitation::where('workspace_id', $workspace->id)
            ->where('email', $email)
            ->first();

        if ($existingInvitation) {
            // Update existing invitation
            $existingInvitation->update([
                'role' => $role,
                'expires_at' => now()->addDays(7),
            ]);
            $invitation = $existingInvitation;
        } else {
            // Create new invitation
            $invitation = WorkspaceInvitation::create([
                'workspace_id' => $workspace->id,
                'email' => $email,
                'role' => $role,
            ]);
        }

        // Send invitation email
        Notification::route('mail', $email)
            ->notify(new TeamInvitationNotification($invitation));

        return $invitation;
    }

    /**
     * Accept an invitation.
     */
    public function accept(WorkspaceInvitation $invitation, User $user): bool
    {
        if ($invitation->hasExpired()) {
            throw new \InvalidArgumentException('This invitation has expired.');
        }

        if ($invitation->email !== $user->email) {
            throw new \InvalidArgumentException('This invitation was sent to a different email address.');
        }

        $workspace = $invitation->workspace;

        // Add user to workspace
        if (! $workspace->hasUser($user)) {
            $workspace->addUser($user, $invitation->role);
        }

        // Switch user to the new workspace
        $user->switchWorkspace($workspace);

        // Delete the invitation
        $invitation->delete();

        return true;
    }

    /**
     * Cancel an invitation.
     */
    public function cancel(WorkspaceInvitation $invitation): bool
    {
        return $invitation->delete();
    }

    /**
     * Check if a workspace can invite more members based on plan limits.
     */
    public function canInvite(Workspace $workspace): bool
    {
        $config = config('billing.plans');
        $currentMembers = $workspace->users()->count();
        $pendingInvitations = $workspace->invitations()->count();
        $totalMembers = $currentMembers + $pendingInvitations;

        // Get plan limits
        if ($workspace->onBusinessPlan()) {
            return true; // Unlimited
        }

        if ($workspace->onProPlan()) {
            $limit = $config['pro']['limits']['team_members'];
        } else {
            $limit = $config['free']['limits']['team_members'];
        }

        return $totalMembers < $limit;
    }

    /**
     * Get the team member limit message for the workspace.
     */
    public function getMemberLimitMessage(Workspace $workspace): string
    {
        $config = config('billing.plans');
        $currentMembers = $workspace->users()->count();

        if ($workspace->onBusinessPlan()) {
            return "You have {$currentMembers} team members with unlimited seats on the Business plan.";
        }

        if ($workspace->onProPlan()) {
            $limit = $config['pro']['limits']['team_members'];
            $plan = 'Pro';
        } else {
            $limit = $config['free']['limits']['team_members'];
            $plan = 'Free';
        }

        return "You have {$currentMembers} of {$limit} team members on the {$plan} plan.";
    }
}
