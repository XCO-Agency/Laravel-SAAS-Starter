<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create([
        'owner_id' => $this->user->id,
    ]);
    $this->workspace->users()->attach($this->user->id, ['role' => 'owner']);
    $this->user->current_workspace_id = $this->workspace->id;
    $this->user->save();
});

it('renders the usage dashboard page', function () {
    $response = $this->actingAs($this->user)
        ->get(route('usage.index'));

    $response->assertStatus(200);

    $response->assertInertia(fn (Assert $page) => $page
        ->component('usage/index')
        ->has('workspace')
        ->has('usage')
        ->where('workspace.plan', 'Free')
        ->has('usage.workspaces')
        ->has('usage.team_members')
        ->has('usage.api_keys')
        ->has('usage.webhooks')
    );
});
