<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;

it('belongs to a workspace', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $invitation = WorkspaceInvitation::factory()->create([
        'workspace_id' => $workspace->id,
    ]);

    expect($invitation->workspace)->toBeInstanceOf(Workspace::class);
    expect($invitation->workspace->id)->toBe($workspace->id);
});

it('auto-generates a token on creation', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'test@example.com',
        'role' => 'member',
    ]);

    expect($invitation->token)->not->toBeNull();
    expect(strlen($invitation->token))->toBe(64);
});

it('auto-sets expires_at on creation', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'test@example.com',
        'role' => 'member',
    ]);

    expect($invitation->expires_at)->not->toBeNull();
    expect($invitation->expires_at->isFuture())->toBeTrue();
});

it('correctly identifies expired invitations', function () {
    $invitation = new WorkspaceInvitation([
        'expires_at' => now()->subDay(),
    ]);
    // Need to set the cast manually
    $invitation->expires_at = now()->subDay();

    expect($invitation->hasExpired())->toBeTrue();
    expect($invitation->isValid())->toBeFalse();
});

it('correctly identifies valid invitations', function () {
    $invitation = new WorkspaceInvitation;
    $invitation->expires_at = now()->addDay();

    expect($invitation->hasExpired())->toBeFalse();
    expect($invitation->isValid())->toBeTrue();
});

it('has correct fillable attributes', function () {
    $invitation = new WorkspaceInvitation;
    expect($invitation->getFillable())->toContain(
        'workspace_id', 'email', 'role', 'token', 'expires_at'
    );
});
