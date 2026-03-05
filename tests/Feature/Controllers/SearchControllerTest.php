<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->user = User::factory()->withoutTwoFactor()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->users()->attach($this->user->id, ['role' => 'owner']);
    $this->user->update(['current_workspace_id' => $this->workspace->id]);
});

it('returns search results as json', function () {
    $this->actingAs($this->user)
        ->getJson(route('search.index', ['query' => 'test']))
        ->assertOk();
});

it('returns empty array for empty query', function () {
    $this->actingAs($this->user)
        ->getJson(route('search.index', ['query' => '']))
        ->assertOk()
        ->assertExactJson([]);
});

it('superadmin searches across all resources', function () {
    $admin = User::factory()->withoutTwoFactor()->create(['is_superadmin' => true]);
    $adminWorkspace = Workspace::factory()->create(['owner_id' => $admin->id]);
    $adminWorkspace->users()->attach($admin->id, ['role' => 'owner']);
    $admin->update(['current_workspace_id' => $adminWorkspace->id]);

    $this->actingAs($admin)
        ->getJson(route('search.index', ['query' => 'test']))
        ->assertOk();
});

it('denies access to unauthenticated users', function () {
    $this->getJson(route('search.index', ['query' => 'test']))
        ->assertUnauthorized();
});
