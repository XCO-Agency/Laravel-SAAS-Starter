<?php

namespace App\Http\Controllers;

use App\Models\WorkspaceInvitation;
use App\Services\InvitationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function __construct(
        protected InvitationService $invitationService
    ) {}

    /**
     * Display the invitation acceptance page.
     */
    public function show(string $token): Response|RedirectResponse
    {
        $invitation = WorkspaceInvitation::where('token', $token)
            ->with('workspace:id,name,logo')
            ->first();

        if (! $invitation) {
            return redirect()->route('home')
                ->with('error', 'This invitation is invalid or has already been used.');
        }

        if ($invitation->hasExpired()) {
            return redirect()->route('home')
                ->with('error', 'This invitation has expired.');
        }

        return Inertia::render('invitation/accept', [
            'invitation' => [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'workspace' => [
                    'id' => $invitation->workspace->id,
                    'name' => $invitation->workspace->name,
                    'logo' => $invitation->workspace->logo,
                ],
                'expires_at' => $invitation->expires_at,
            ],
        ]);
    }

    /**
     * Accept the invitation.
     */
    public function accept(Request $request, string $token): RedirectResponse
    {
        $user = $request->user();

        $invitation = WorkspaceInvitation::where('token', $token)->with('workspace')->first();

        if (! $invitation) {
            return redirect()->route('home')
                ->with('error', 'This invitation is invalid or has already been used.');
        }

        if ($invitation->hasExpired()) {
            $invitation->delete();

            return redirect()->route('home')
                ->with('error', 'This invitation has expired and has been removed.');
        }

        if ($invitation->workspace->hasUser($user)) {
            $invitation->delete();

            return redirect()->route('dashboard')
                ->with('info', 'You are already a member of '.$invitation->workspace->name.'.');
        }

        try {
            $this->invitationService->accept($invitation, $user);

            return redirect()->route('dashboard')
                ->with('success', "You have joined {$invitation->workspace->name}!");
        } catch (\InvalidArgumentException $e) {
            return redirect()->route('home')
                ->with('error', $e->getMessage());
        }
    }
}
