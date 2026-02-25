<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;

it('redirects to home when invitation token is invalid', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/invitations/invalid-token/accept');

    $response->assertRedirect('/');
    $response->assertSessionHas('error');
});

it('redirects with error when invitation is expired', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => User::factory()->create()->id]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => $user->email,
        'role' => 'member',
        'token' => 'expired-token-123',
        'expires_at' => now()->subDay(),
    ]);

    $response = $this->actingAs($user)->post("/invitations/{$invitation->token}/accept");

    $response->assertRedirect('/');
    $response->assertSessionHas('error');
    expect(WorkspaceInvitation::find($invitation->id))->toBeNull();
});

it('redirects gracefully when user is already a member', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $user = User::factory()->create();
    $workspace->addUser($user, 'member');

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => $user->email,
        'role' => 'member',
        'token' => 'already-member-token',
        'expires_at' => now()->addDays(7),
    ]);

    $response = $this->actingAs($user)->post("/invitations/{$invitation->token}/accept");

    $response->assertRedirect(route('dashboard'));
    $response->assertSessionHas('info');
    expect(WorkspaceInvitation::find($invitation->id))->toBeNull();
});

it('accepts a valid invitation and joins the workspace', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $user = User::factory()->create();

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => $user->email,
        'role' => 'member',
        'token' => 'valid-token-456',
        'expires_at' => now()->addDays(7),
    ]);

    $response = $this->actingAs($user)->post("/invitations/{$invitation->token}/accept");

    $response->assertRedirect(route('dashboard'));
    $response->assertSessionHas('success');
    expect($workspace->hasUser($user))->toBeTrue();
    expect(WorkspaceInvitation::find($invitation->id))->toBeNull();
});

it('renders the invitation accept page for a valid token', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'invitee@example.com',
        'role' => 'admin',
        'token' => 'show-page-token',
        'expires_at' => now()->addDays(7),
    ]);

    $response = $this->get("/invitations/{$invitation->token}");

    $response->assertOk();
});
