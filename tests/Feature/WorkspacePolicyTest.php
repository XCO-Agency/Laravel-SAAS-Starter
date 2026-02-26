<?php

use App\Models\User;
use App\Models\Workspace;
use App\Policies\WorkspacePolicy;

beforeEach(function () {
    $this->policy = new WorkspacePolicy;
    $this->owner = User::factory()->create();
    $this->admin = User::factory()->create();
    $this->member = User::factory()->create();

    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->users()->attach($this->owner->id, ['role' => 'owner']);
    $this->workspace->users()->attach($this->admin->id, ['role' => 'admin']);
    $this->workspace->users()->attach($this->member->id, ['role' => 'member']);
});

it('allows owners to manage everything', function () {
    expect($this->policy->manageBilling($this->owner, $this->workspace))->toBeTrue();
    expect($this->policy->manageWebhooks($this->owner, $this->workspace))->toBeTrue();
    expect($this->policy->viewActivityLogging($this->owner, $this->workspace))->toBeTrue();
    expect($this->policy->manageTeam($this->owner, $this->workspace))->toBeTrue();
    expect($this->policy->delete($this->owner, $this->workspace))->toBeTrue();
});

it('allows admins to manage team and webhooks but not billing or delete', function () {
    expect($this->policy->manageTeam($this->admin, $this->workspace))->toBeTrue();
    expect($this->policy->manageWebhooks($this->admin, $this->workspace))->toBeTrue();
    expect($this->policy->viewActivityLogging($this->admin, $this->workspace))->toBeTrue();

    expect($this->policy->manageBilling($this->admin, $this->workspace))->toBeFalse();
    expect($this->policy->delete($this->admin, $this->workspace))->toBeFalse();
});

it('denies members from managing most things', function () {
    expect($this->policy->manageTeam($this->member, $this->workspace))->toBeFalse();
    expect($this->policy->manageWebhooks($this->member, $this->workspace))->toBeFalse();
    expect($this->policy->manageBilling($this->member, $this->workspace))->toBeFalse();
    expect($this->policy->delete($this->member, $this->workspace))->toBeFalse();
});
