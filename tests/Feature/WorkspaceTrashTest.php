<?php

use App\Models\User;
use App\Models\Workspace;
use App\Services\WorkspaceService;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->otherUser = User::factory()->create();
    $workspaceService = app(WorkspaceService::class);
    $workspaceService->createPersonalWorkspace($this->owner);
    $workspaceService->createPersonalWorkspace($this->otherUser);

    $this->workspace = $workspaceService->create($this->owner, ['name' => 'Test Workspace']);
});

it('lists trashed workspaces for the owner', function () {
    $this->workspace->delete();

    $response = $this->actingAs($this->owner)
        ->get('/workspaces/trash');

    $response->assertSuccessful();
    $response->assertInertia(
        fn ($page) => $page
            ->component('workspaces/trash')
            ->has('trashedWorkspaces', 1)
            ->where('trashedWorkspaces.0.name', 'Test Workspace')
    );
});

it('does not show trashed workspaces to non-owners', function () {
    $this->workspace->delete();

    $response = $this->actingAs($this->otherUser)
        ->get('/workspaces/trash');

    $response->assertSuccessful();
    $response->assertInertia(
        fn ($page) => $page
            ->has('trashedWorkspaces', 0)
    );
});

it('allows an owner to restore a trashed workspace', function () {
    $this->workspace->delete();

    expect(Workspace::withTrashed()->find($this->workspace->id)->trashed())->toBeTrue();

    $response = $this->actingAs($this->owner)
        ->post("/workspaces/trash/{$this->workspace->id}/restore");

    $response->assertSuccessful();

    $this->workspace->refresh();
    expect($this->workspace->trashed())->toBeFalse();
});

it('prevents non-owners from restoring a workspace', function () {
    $this->workspace->delete();

    $response = $this->actingAs($this->otherUser)
        ->post("/workspaces/trash/{$this->workspace->id}/restore");

    $response->assertForbidden();
});

it('allows an owner to permanently delete a workspace', function () {
    $this->workspace->delete();

    $response = $this->actingAs($this->owner)
        ->delete("/workspaces/trash/{$this->workspace->id}");

    $response->assertSuccessful();

    expect(Workspace::withTrashed()->find($this->workspace->id))->toBeNull();
});

it('prevents non-owners from permanently deleting a workspace', function () {
    $this->workspace->delete();

    $response = $this->actingAs($this->otherUser)
        ->delete("/workspaces/trash/{$this->workspace->id}");

    $response->assertForbidden();
});

it('prunes workspaces trashed beyond the grace period', function () {
    $this->workspace->delete();
    // Backdate deleted_at to 31 days ago
    Workspace::withTrashed()
        ->where('id', $this->workspace->id)
        ->update(['deleted_at' => now()->subDays(31)]);

    $this->artisan('workspaces:prune-trashed --days=30')
        ->expectsOutputToContain('Permanently deleted 1')
        ->assertSuccessful();

    expect(Workspace::withTrashed()->find($this->workspace->id))->toBeNull();
});

it('does not prune recently trashed workspaces', function () {
    $this->workspace->delete();

    $this->artisan('workspaces:prune-trashed --days=30')
        ->expectsOutputToContain('Permanently deleted 0')
        ->assertSuccessful();

    expect(Workspace::withTrashed()->find($this->workspace->id))->not->toBeNull();
});

it('restricts trash access to authenticated users', function () {
    $this->get('/workspaces/trash')->assertRedirect('/login');
});
