<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->user = User::factory()->withoutTwoFactor()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->users()->attach($this->user->id, ['role' => 'owner']);
    $this->user->update(['current_workspace_id' => $this->workspace->id]);
});

it('renders the webhook logs page for authorized users', function () {
    $this->actingAs($this->user)
        ->get(route('workspaces.webhooks.logs.index', $this->workspace))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('workspaces/webhooks/logs')
            ->has('logs')
        );
});

it('denies access to non-authorized members', function () {
    $member = User::factory()->withoutTwoFactor()->create();
    $this->workspace->users()->attach($member->id, ['role' => 'member']);
    $member->update(['current_workspace_id' => $this->workspace->id]);

    $this->actingAs($member)
        ->get(route('workspaces.webhooks.logs.index', $this->workspace))
        ->assertForbidden();
});

it('denies access to unauthenticated users', function () {
    $this->get(route('workspaces.webhooks.logs.index', $this->workspace))
        ->assertRedirect(route('login'));
});
