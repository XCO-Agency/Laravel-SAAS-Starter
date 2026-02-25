<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->admin = User::factory()->create();
    $this->member = User::factory()->create();

    $this->workspace = Workspace::factory()->create([
        'owner_id' => $this->owner->id,
    ]);

    // Attach users with native macro roles securely
    $this->workspace->users()->attach($this->owner->id, ['role' => 'owner']);
    $this->workspace->users()->attach($this->admin->id, ['role' => 'admin']);
    $this->workspace->users()->attach($this->member->id, ['role' => 'member']);

    // Switch workspaces explicitly
    $this->owner->switchWorkspace($this->workspace);
    $this->admin->switchWorkspace($this->workspace);
    $this->member->switchWorkspace($this->workspace);
});

it('allows owners and admins to manage webhooks natively through Gates', function () {
    $this->actingAs($this->owner)
        ->get("/workspaces/{$this->workspace->id}/webhooks")
        ->assertOk();

    $this->actingAs($this->admin)
        ->get("/workspaces/{$this->workspace->id}/webhooks")
        ->assertOk();
});

it('prevents standard members from managing webhooks explicitly', function () {
    $this->actingAs($this->member)
        ->get("/workspaces/{$this->workspace->id}/webhooks")
        ->assertForbidden();
});

it('allows standard members with strict specific granular permissions to manage webhooks', function () {
    // Manually grant manage_webhooks JSON array permission natively to pivot
    $this->workspace->users()->updateExistingPivot($this->member->id, [
        'permissions' => json_encode(['manage_webhooks']),
    ]);

    $this->actingAs($this->member)
        ->get("/workspaces/{$this->workspace->id}/webhooks")
        ->assertOk();
});

it('allows administrators to functionally update underlying member capabilities', function () {
    $this->actingAs($this->admin)
        ->put("/team/members/{$this->member->id}/permissions", [
            'permissions' => ['manage_billing', 'manage_webhooks'],
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('workspace_user', [
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->member->id,
        'permissions' => json_encode(['manage_billing', 'manage_webhooks']),
    ]);
});

it('enforces gate integrity preventing standard members from updating capabilities natively', function () {
    $this->actingAs($this->member)
        ->put("/team/members/{$this->admin->id}/permissions", [
            'permissions' => ['manage_team'],
        ])
        ->assertForbidden();
});
