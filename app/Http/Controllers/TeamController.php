<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WorkspaceInvitation;
use App\Services\InvitationService;
use App\Services\WorkspaceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function __construct(
        protected InvitationService $invitationService,
        protected WorkspaceService $workspaceService
    ) {}

    /**
     * Display the team members list.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        return Inertia::render('Team/index', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'owner_id' => $workspace->owner_id,
                'plan' => $workspace->plan_name,
            ],
            'members' => $workspace->users()
                ->select('users.id', 'users.name', 'users.email', 'users.bio', 'users.timezone')
                ->get()
                ->map(fn ($member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'bio' => $member->bio,
                    'timezone' => $member->timezone,
                    'role' => $member->pivot->role,
                    'permissions' => json_decode($member->pivot->permissions, true) ?? [],
                    'joined_at' => $member->pivot->created_at,
                    'is_current_user' => $member->id === $user->id,
                ]),
            'pendingInvitations' => $workspace->invitations()
                ->select('id', 'email', 'role', 'expires_at', 'created_at')
                ->get(),
            'userRole' => $workspace->getUserRole($user),
            'canInvite' => $this->invitationService->canInvite($workspace),
            'memberLimitMessage' => $this->invitationService->getMemberLimitMessage($workspace),
        ]);
    }

    /**
     * Send an invitation to join the workspace.
     */
    public function invite(Request $request): RedirectResponse
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;
        Gate::authorize('manageTeam', $workspace);

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', Rule::in(['admin', 'member'])],
        ]);

        if (! $this->invitationService->canInvite($workspace)) {
            return redirect()->back()
                ->with('error', 'You have reached your team member limit. Please upgrade your plan to invite more members.');
        }

        try {
            $this->invitationService->invite($workspace, $validated['email'], $validated['role']);

            return redirect()->back()
                ->with('success', "Invitation sent to {$validated['email']}.");
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove a member from the workspace.
     */
    public function removeMember(Request $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();
        $workspace = $currentUser->currentWorkspace;
        Gate::authorize('manageTeam', $workspace);

        // Cannot remove the owner
        if ($workspace->userIsOwner($user)) {
            return redirect()->back()
                ->with('error', 'Cannot remove the workspace owner.');
        }

        // Cannot remove yourself unless you're not the owner
        if ($user->id === $currentUser->id) {
            return redirect()->back()
                ->with('error', 'You cannot remove yourself from the workspace.');
        }

        $workspace->removeUser($user);

        // If the removed user's current workspace is this one, switch them to their personal workspace
        if ($user->current_workspace_id === $workspace->id) {
            $personalWorkspace = $user->personalWorkspace();
            if ($personalWorkspace) {
                $user->switchWorkspace($personalWorkspace);
            }
        }

        return redirect()->back()
            ->with('success', "{$user->name} has been removed from the workspace.");
    }

    /**
     * Update a member's role.
     */
    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();
        $workspace = $currentUser->currentWorkspace;
        Gate::authorize('manageTeam', $workspace);

        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'member'])],
        ]);

        // Cannot change owner's role
        if ($workspace->userIsOwner($user)) {
            return redirect()->back()
                ->with('error', 'Cannot change the role of the workspace owner.');
        }

        $workspace->updateUserRole($user, $validated['role']);

        return redirect()->back()
            ->with('success', "{$user->name}'s role has been updated to {$validated['role']}.");
    }

    /**
     * Update a member's granular permissions.
     */
    public function updatePermissions(Request $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();
        $workspace = $currentUser->currentWorkspace;
        Gate::authorize('manageTeam', $workspace);

        $validated = $request->validate([
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string'],
        ]);

        if (!$workspace->hasUser($user)) {
            abort(404);
        }

        if ($workspace->userIsOwner($user)) {
            return redirect()->back()->with('error', 'Cannot modify the permissions of the workspace owner.');
        }

        $workspace->users()->updateExistingPivot($user->id, [
            'permissions' => json_encode($validated['permissions'])
        ]);

        return redirect()->back()
            ->with('success', "{$user->name}'s granular permissions have been updated.");
    }

    /**
     * Transfer workspace ownership to another user.
     */
    public function transferOwnership(Request $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();
        $workspace = $currentUser->currentWorkspace;
        Gate::authorize('delete', $workspace);

        // Cannot transfer personal workspace
        if ($workspace->personal_workspace) {
            return redirect()->back()
                ->with('error', 'Cannot transfer ownership of a personal workspace.');
        }

        // Target must be an admin
        if (! $workspace->userIsAdmin($user)) {
            return redirect()->back()
                ->with('error', 'You can only transfer ownership to an admin.');
        }

        try {
            $this->workspaceService->transferOwnership($workspace, $user);

            return redirect()->back()
                ->with('success', "Workspace ownership has been transferred to {$user->name}.");
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Cancel a pending invitation.
     */
    public function cancelInvitation(Request $request, WorkspaceInvitation $invitation): RedirectResponse
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;
        Gate::authorize('manageTeam', $workspace);

        // Ensure invitation belongs to current workspace
        if ($invitation->workspace_id !== $workspace->id) {
            abort(403);
        }

        $this->invitationService->cancel($invitation);

        return redirect()->back()
            ->with('success', 'Invitation cancelled.');
    }
}
