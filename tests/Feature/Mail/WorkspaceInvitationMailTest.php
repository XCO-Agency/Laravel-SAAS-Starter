<?php

use App\Mail\WorkspaceInvitation as WorkspaceInvitationMail;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;

it('sets correct workspace name', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'test@example.com',
        'role' => 'member',
    ]);

    $mail = new WorkspaceInvitationMail($invitation);

    expect($mail->workspaceName)->toBe($workspace->name);
});

it('sets correct inviter name', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'test@example.com',
        'role' => 'member',
    ]);

    $mail = new WorkspaceInvitationMail($invitation);

    expect($mail->inviterName)->toBe($user->name);
});

it('generates correct accept URL', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'test@example.com',
        'role' => 'member',
    ]);

    $mail = new WorkspaceInvitationMail($invitation);

    expect($mail->acceptUrl)->toContain($invitation->token);
});

it('capitalizes the role', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'test@example.com',
        'role' => 'admin',
    ]);

    $mail = new WorkspaceInvitationMail($invitation);

    expect($mail->role)->toBe('Admin');
});
