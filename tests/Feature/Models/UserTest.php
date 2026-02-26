<?php

use App\Models\User;
use App\Models\Workspace;

test('user has workspaces relationship', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    expect($user->workspaces)->toHaveCount(1);
    expect($user->workspaces->first()->id)->toBe($workspace->id);
});

test('user has ownedWorkspaces relationship', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    expect($user->ownedWorkspaces)->toHaveCount(1);
    expect($user->ownedWorkspaces->first()->id)->toBe($workspace->id);
});

test('user can check role in workspace', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    expect($user->roleInWorkspace($workspace))->toBe('owner');
});

test('user can check if belongs to workspace', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    expect($user->belongsToWorkspace($workspace))->toBeTrue();
    
    $otherWorkspace = Workspace::factory()->create();
    expect($user->belongsToWorkspace($otherWorkspace))->toBeFalse();
});
