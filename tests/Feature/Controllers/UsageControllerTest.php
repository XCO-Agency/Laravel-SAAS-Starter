<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->user = User::factory()->withoutTwoFactor()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->users()->attach($this->user->id, ['role' => 'owner']);
    $this->user->update(['current_workspace_id' => $this->workspace->id]);
});

it('renders the usage page', function () {
    $this->actingAs($this->user)
        ->get(route('usage.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('usage/index')
            ->has('usage')
        );
});

it('returns usage data with correct keys', function () {
    $this->actingAs($this->user)
        ->get(route('usage.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('usage.workspaces')
            ->has('usage.team_members')
            ->has('usage.api_keys')
            ->has('usage.webhooks')
        );
});

it('denies access to unauthenticated users', function () {
    $this->get(route('usage.index'))
        ->assertRedirect(route('login'));
});
