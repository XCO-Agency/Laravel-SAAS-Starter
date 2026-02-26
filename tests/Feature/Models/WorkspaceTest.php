<?php

use App\Models\User;
use App\Models\Workspace;

test('workspace has owner relationship', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);

    expect($workspace->owner->id)->toBe($owner->id);
});

test('workspace has users relationship', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    $workspace->users()->attach($user->id, ['role' => 'member']);

    expect($workspace->users)->toHaveCount(1);
    expect($workspace->users->first()->id)->toBe($user->id);
});

test('workspace can check if user is owner', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $workspace->users()->attach($owner->id, ['role' => 'owner']);

    expect($workspace->userIsOwner($owner))->toBeTrue();
    
    $other = User::factory()->create();
    expect($workspace->userIsOwner($other))->toBeFalse();
});

test('workspace can update user role', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();
    $workspace->users()->attach($user->id, ['role' => 'member']);

    $workspace->updateUserRole($user, 'admin');

    expect($user->fresh()->roleInWorkspace($workspace))->toBe('admin');
});

test('workspace resolves plan name correctly', function () {
    $workspace = Workspace::factory()->create();
    
    // Default should be Free
    expect($workspace->plan_name)->toBe('Free');
});
