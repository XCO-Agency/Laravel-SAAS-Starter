<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInviteLinkRequest;
use App\Models\WorkspaceInviteLink;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkspaceInviteLinkController extends Controller
{
    /**
     * Generate a new invite link.
     */
    public function store(StoreInviteLinkRequest $request): \Illuminate\Http\RedirectResponse
    {
        $workspace = $request->user()->currentWorkspace;

        $expiresAt = $request->validated('expires_in_days')
            ? now()->addDays($request->validated('expires_in_days'))
            : null;

        WorkspaceInviteLink::generateLink(
            $workspace,
            $request->user(),
            $request->validated('role'),
            $request->validated('max_uses'),
            $expiresAt,
        );

        return back()->with('success', 'Invite link created successfully.');
    }

    /**
     * Revoke an invite link.
     */
    public function destroy(Request $request, int $id): \Illuminate\Http\RedirectResponse
    {
        $workspace = $request->user()->currentWorkspace;

        if (! $workspace || ! $workspace->userIsAdmin($request->user())) {
            abort(403);
        }

        $link = WorkspaceInviteLink::where('workspace_id', $workspace->id)
            ->findOrFail($id);

        $link->delete();

        return back()->with('success', 'Invite link revoked.');
    }

    /**
     * Show the public invite link acceptance page.
     */
    public function show(string $token): \Inertia\Response|\Illuminate\Http\RedirectResponse
    {
        $link = WorkspaceInviteLink::with('workspace:id,name,slug')
            ->where('token', $token)
            ->first();

        if (! $link) {
            return redirect()->route('home')->with('error', 'This invite link is invalid.');
        }

        if (! $link->isUsable()) {
            return redirect()->route('home')->with('error', 'This invite link has expired or reached its maximum uses.');
        }

        return Inertia::render('Team/join', [
            'inviteLink' => [
                'token' => $link->token,
                'role' => $link->role,
                'workspace_name' => $link->workspace->name,
            ],
        ]);
    }

    /**
     * Accept the invite link and join the workspace.
     */
    public function join(Request $request, string $token): \Illuminate\Http\RedirectResponse
    {
        $link = WorkspaceInviteLink::with('workspace')
            ->where('token', $token)
            ->firstOrFail();

        if (! $link->isUsable()) {
            return back()->with('error', 'This invite link has expired or reached its maximum uses.');
        }

        $user = $request->user();
        $workspace = $link->workspace;

        // Check if user is already a member
        if ($workspace->hasUser($user)) {
            return redirect()->route('dashboard')->with('info', 'You are already a member of this workspace.');
        }

        $workspace->addUser($user, $link->role);
        $link->incrementUses();
        $user->switchWorkspace($workspace);

        return redirect()->route('dashboard')->with('success', "You've joined {$workspace->name}!");
    }
}
