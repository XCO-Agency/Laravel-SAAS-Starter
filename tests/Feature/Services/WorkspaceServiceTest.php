<?php

use App\Models\User;
use App\Models\Workspace;
use App\Services\WorkspaceService;

beforeEach(function () {
    $this->service = new WorkspaceService();
    $this->user = User::factory()->create();
});

it('can create a new workspace', function () {
    $workspace = $this->service->create($this->user, ['name' => 'New Workspace']);

    expect($workspace)->toBeInstanceOf(Workspace::class);
    expect($workspace->owner_id)->toBe($this->user->id);
    
    // Check if owner is in the pivot with correct role
    expect($this->user->fresh()->roleInWorkspace($workspace))->toBe('owner');
});

it('can transfer ownership and demote old owner to admin', function () {
    $workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $workspace->users()->attach($this->user->id, ['role' => 'owner']);
    
    $newOwner = User::factory()->create();
    $workspace->users()->attach($newOwner->id, ['role' => 'admin']);

    $this->service->transferOwnership($workspace, $newOwner);

    expect($workspace->fresh()->owner_id)->toBe($newOwner->id);
    expect($newOwner->fresh()->roleInWorkspace($workspace))->toBe('owner');
    expect($this->user->fresh()->roleInWorkspace($workspace))->toBe('admin');
});
