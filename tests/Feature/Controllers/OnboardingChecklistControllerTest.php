<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->user = User::factory()->withoutTwoFactor()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->users()->attach($this->user->id, ['role' => 'owner']);
    $this->user->update(['current_workspace_id' => $this->workspace->id]);
});

it('returns the onboarding checklist as json', function () {
    $this->actingAs($this->user)
        ->getJson(route('onboarding-checklist.index'))
        ->assertOk()
        ->assertJsonStructure([
            'dismissed',
            'steps',
        ]);
});

it('can dismiss the onboarding checklist', function () {
    $this->actingAs($this->user)
        ->postJson(route('onboarding-checklist.dismiss'))
        ->assertOk();
});

it('denies access to unauthenticated users', function () {
    $this->getJson(route('onboarding-checklist.index'))
        ->assertUnauthorized();
});
