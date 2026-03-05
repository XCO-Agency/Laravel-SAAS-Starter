<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInviteLink;

it('belongs to a workspace', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $link = WorkspaceInviteLink::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    expect($link->workspace)->toBeInstanceOf(Workspace::class);
});

it('belongs to a creator', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $link = WorkspaceInviteLink::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
    ]);

    expect($link->creator)->toBeInstanceOf(User::class);
    expect($link->creator->id)->toBe($user->id);
});

it('detects expired links', function () {
    $link = new WorkspaceInviteLink;
    $link->expires_at = now()->subDay();

    expect($link->isExpired())->toBeTrue();
});

it('detects non-expired links', function () {
    $link = new WorkspaceInviteLink;
    $link->expires_at = now()->addDay();

    expect($link->isExpired())->toBeFalse();
});

it('treats null expires_at as not expired', function () {
    $link = new WorkspaceInviteLink;
    $link->expires_at = null;

    expect($link->isExpired())->toBeFalse();
});

it('detects exhausted links', function () {
    $link = new WorkspaceInviteLink;
    $link->max_uses = 5;
    $link->uses_count = 5;

    expect($link->isExhausted())->toBeTrue();
});

it('detects non-exhausted links', function () {
    $link = new WorkspaceInviteLink;
    $link->max_uses = 10;
    $link->uses_count = 3;

    expect($link->isExhausted())->toBeFalse();
});

it('treats null max_uses as not exhausted', function () {
    $link = new WorkspaceInviteLink;
    $link->max_uses = null;
    $link->uses_count = 100;

    expect($link->isExhausted())->toBeFalse();
});

it('is usable when not expired and not exhausted', function () {
    $link = new WorkspaceInviteLink;
    $link->expires_at = now()->addDay();
    $link->max_uses = 10;
    $link->uses_count = 5;

    expect($link->isUsable())->toBeTrue();
});

it('is not usable when expired', function () {
    $link = new WorkspaceInviteLink;
    $link->expires_at = now()->subDay();
    $link->max_uses = 10;
    $link->uses_count = 0;

    expect($link->isUsable())->toBeFalse();
});

it('is not usable when exhausted', function () {
    $link = new WorkspaceInviteLink;
    $link->expires_at = now()->addDay();
    $link->max_uses = 5;
    $link->uses_count = 5;

    expect($link->isUsable())->toBeFalse();
});

it('generates a link with static factory method', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $link = WorkspaceInviteLink::generateLink(
        $workspace,
        $user,
        'member',
        10,
        now()->addWeek()
    );

    expect($link)->toBeInstanceOf(WorkspaceInviteLink::class);
    expect($link->token)->not->toBeNull();
    expect(strlen($link->token))->toBe(64);
    expect($link->workspace_id)->toBe($workspace->id);
    expect($link->created_by)->toBe($user->id);
    expect($link->role)->toBe('member');
    expect($link->max_uses)->toBe(10);
});

it('increments uses count', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $link = WorkspaceInviteLink::factory()->create([
        'workspace_id' => $workspace->id,
        'created_by' => $user->id,
        'uses_count' => 0,
    ]);

    $link->incrementUses();
    $link->refresh();

    expect($link->uses_count)->toBe(1);
});
