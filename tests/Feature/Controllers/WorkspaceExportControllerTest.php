<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->user = User::factory()->withoutTwoFactor()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->users()->attach($this->user->id, ['role' => 'owner']);
    $this->user->update(['current_workspace_id' => $this->workspace->id]);
});

it('exports workspace data as a json stream', function () {
    $this->actingAs($this->user)
        ->get(route('workspaces.export'))
        ->assertOk()
        ->assertHeader('content-type', 'application/json')
        ->assertHeader('content-disposition');
});

it('denies export to non-owner members', function () {
    $member = User::factory()->withoutTwoFactor()->create();
    $this->workspace->users()->attach($member->id, ['role' => 'member']);
    $member->update(['current_workspace_id' => $this->workspace->id]);

    $this->actingAs($member)
        ->get(route('workspaces.export'))
        ->assertForbidden();
});

it('denies export to unauthenticated users', function () {
    $this->get(route('workspaces.export'))
        ->assertRedirect(route('login'));
});
