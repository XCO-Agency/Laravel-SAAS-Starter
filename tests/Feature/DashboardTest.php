<?php

use App\Models\User;
use App\Models\Workspace;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->addUser($user, 'owner');
    $user->switchWorkspace($workspace);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('workspace')
            ->where('workspace.name', $workspace->name)
        );
});

test('dashboard shows current workspace info', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'name' => 'Test Workspace',
    ]);
    $workspace->addUser($user, 'owner');
    $user->switchWorkspace($workspace);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('workspace.name', 'Test Workspace')
            ->has('workspace.plan')
            ->has('workspace.members_count')
        );
});
