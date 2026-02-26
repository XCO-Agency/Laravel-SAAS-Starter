<?php

use App\Models\User;
use App\Models\Workspace;
use App\Services\PlanLimitService;

beforeEach(function () {
    $this->service = new PlanLimitService;
    $this->user = User::factory()->create();
});

it('can get limits for different plans', function () {
    $freeLimits = $this->service->getLimits('free');
    $proLimits = $this->service->getLimits('pro');
    $businessLimits = $this->service->getLimits('business');

    expect($freeLimits['workspaces'])->toBe(1);
    expect($proLimits['workspaces'])->toBe(5);
    expect($businessLimits['team_members'])->toBe(-1);
});

it('defaults to free limits for unknown plans', function () {
    $limits = $this->service->getLimits('unknown_plan');

    expect($limits['workspaces'])->toBe(1);
    expect($limits['team_members'])->toBe(2);
});

it('calculates the maximum number of workspaces based on the highest plan', function () {
    expect($this->service->getMaxWorkspacesForUser($this->user))->toBe(1);

    $workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);

    // Mock the resolved plan property via reflection
    $reflection = new ReflectionClass($workspace);
    $property = $reflection->getProperty('resolvedPlan');
    $property->setAccessible(true);
    $property->setValue($workspace, ['name' => 'Pro', 'key' => 'pro']);

    // Set the relation on user so it's not fetched from DB
    $this->user->setRelation('ownedWorkspaces', collect([$workspace]));

    expect($this->service->getMaxWorkspacesForUser($this->user))->toBe(5);
});

it('determines if a user can create another workspace', function () {
    expect($this->service->canCreateWorkspace($this->user))->toBeTrue();

    $workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->user->unsetRelation('ownedWorkspaces'); // Ensure count() hits DB or fresh relation

    expect($this->service->canCreateWorkspace($this->user))->toBeFalse();

    // Upgrade to Pro by setting mock resolved plan and relation
    $reflection = new ReflectionClass($workspace);
    $property = $reflection->getProperty('resolvedPlan');
    $property->setAccessible(true);
    $property->setValue($workspace, ['name' => 'Pro', 'key' => 'pro']);

    $this->user->setRelation('ownedWorkspaces', collect([$workspace]));

    expect($this->service->canCreateWorkspace($this->user))->toBeTrue();
});

it('determines if a workspace can invite more team members', function () {
    $workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $workspace->users()->attach($this->user->id, ['role' => 'owner']);

    // Free plan: 2 members limit, current is 1.
    expect($this->service->canInviteTeamMember($workspace))->toBeTrue();

    // Add 1 more member = 2 (limit reached)
    $member = User::factory()->create();
    $workspace->users()->attach($member->id, ['role' => 'member']);

    $workspace->unsetRelation('users');

    expect($this->service->canInviteTeamMember($workspace))->toBeFalse();
});
