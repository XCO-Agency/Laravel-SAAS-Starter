<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->user = User::factory()->withoutTwoFactor()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->users()->attach($this->user->id, ['role' => 'owner']);
    $this->user->update(['current_workspace_id' => $this->workspace->id]);
});

it('renders the activity page for workspace owner', function () {
    $this->actingAs($this->user)
        ->get(route('workspaces.activity', $this->workspace))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('workspaces/activity/index')
            ->has('activities')
            ->has('eventTypes')
        );
});

it('supports filtering by event type', function () {
    $this->actingAs($this->user)
        ->get(route('workspaces.activity', ['workspace' => $this->workspace, 'event' => 'created']))
        ->assertOk();
});

it('denies access to non-authorized members', function () {
    $member = User::factory()->withoutTwoFactor()->create();
    $this->workspace->users()->attach($member->id, ['role' => 'member']);
    $member->update(['current_workspace_id' => $this->workspace->id]);

    $this->actingAs($member)
        ->get(route('workspaces.activity', $this->workspace))
        ->assertForbidden();
});

it('denies access to unauthenticated users', function () {
    $this->get(route('workspaces.activity', $this->workspace))
        ->assertRedirect(route('login'));
});
