<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Notifications\TeamInvitationNotification;

it('sends via mail channel', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'invited@example.com',
        'role' => 'member',
    ]);

    $notification = new TeamInvitationNotification($invitation);
    $channels = $notification->via($user);

    expect($channels)->toBe(['mail']);
});

it('converts to array with correct structure', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'invited@example.com',
        'role' => 'admin',
    ]);

    $notification = new TeamInvitationNotification($invitation);
    $array = $notification->toArray($user);

    expect($array)->toHaveKeys(['invitation_id', 'workspace_id', 'workspace_name', 'role']);
    expect($array['workspace_id'])->toBe($workspace->id);
    expect($array['role'])->toBe('admin');
});

it('creates a mailable for mail delivery', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'invited@example.com',
        'role' => 'member',
    ]);

    $notification = new TeamInvitationNotification($invitation);
    $mail = $notification->toMail($user);

    expect($mail)->toBeInstanceOf(App\Mail\WorkspaceInvitation::class);
});
