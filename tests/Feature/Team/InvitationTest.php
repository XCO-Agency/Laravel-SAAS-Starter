<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Notifications\TeamInvitationNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
});

it('sends invitation email when admin invites a user', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $workspace->addUser($owner, 'owner');
    $owner->switchWorkspace($workspace);

    $this->actingAs($owner)
        ->post('/team/invite', [
            'email' => 'newuser@example.com',
            'role' => 'member',
        ])
        ->assertRedirect();

    $invitation = WorkspaceInvitation::where('email', 'newuser@example.com')->first();
    expect($invitation)->not->toBeNull();
    expect($invitation->role)->toBe('member');
    expect($invitation->workspace_id)->toBe($workspace->id);

    Notification::assertSentOnDemand(
        TeamInvitationNotification::class,
        fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === 'newuser@example.com'
    );
});

it('shows invitation page for valid token', function () {
    $workspace = Workspace::factory()->create();
    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'invited@example.com',
        'role' => 'member',
    ]);

    $this->get("/invitations/{$invitation->token}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('invitation/accept')
            ->has('invitation')
            ->where('invitation.email', 'invited@example.com')
            ->where('invitation.role', 'member')
        );
});

it('shows sign in and create account options for unauthenticated users', function () {
    $workspace = Workspace::factory()->create();
    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'newuser@example.com',
        'role' => 'member',
    ]);

    $this->get("/invitations/{$invitation->token}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('invitation/accept')
            ->where('invitation.token', $invitation->token)
        );
});

it('allows authenticated user to accept invitation', function () {
    $user = User::factory()->create(['email' => 'invited@example.com']);
    $workspace = Workspace::factory()->create();
    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'invited@example.com',
        'role' => 'member',
    ]);

    $this->actingAs($user)
        ->post("/invitations/{$invitation->token}/accept")
        ->assertRedirect('/dashboard');

    expect($workspace->fresh()->hasUser($user))->toBeTrue();
    expect(WorkspaceInvitation::find($invitation->id))->toBeNull();
});

it('rejects invitation acceptance from wrong email', function () {
    $user = User::factory()->create(['email' => 'wrong@example.com']);
    $workspace = Workspace::factory()->create();
    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'invited@example.com',
        'role' => 'member',
    ]);

    $this->actingAs($user)
        ->post("/invitations/{$invitation->token}/accept")
        ->assertRedirect('/');

    expect($workspace->fresh()->hasUser($user))->toBeFalse();
});

it('rejects expired invitations', function () {
    $workspace = Workspace::factory()->create();
    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'invited@example.com',
        'role' => 'member',
        'expires_at' => now()->subDay(),
    ]);

    $this->get("/invitations/{$invitation->token}")
        ->assertRedirect('/');
});

it('pre-fills email in login page from invitation link', function () {
    $this->get('/login?email=invited@example.com&redirect=/invitations/some-token')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/login')
            ->where('email', 'invited@example.com')
            ->where('redirect', '/invitations/some-token')
        );
});

it('pre-fills email in register page from invitation link', function () {
    $this->get('/register?email=newuser@example.com&redirect=/invitations/some-token')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/register')
            ->where('email', 'newuser@example.com')
            ->where('redirect', '/invitations/some-token')
        );
});
