<?php

use App\Models\User;
use App\Models\Workspace;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('shares auth user data with inertia', function () {
    $user = User::factory()->withoutTwoFactor()->create(['onboarded_at' => now()]);
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);
    $user->update(['current_workspace_id' => $workspace->id]);

    $response = actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('auth.user')
        ->where('auth.user.id', $user->id)
        ->where('auth.user.email', $user->email)
        ->where('auth.user.name', $user->name)
        ->has('auth.user.timezone')
    );
});

it('shares current workspace data with inertia', function () {
    $user = User::factory()->withoutTwoFactor()->create(['onboarded_at' => now()]);
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);
    $user->update(['current_workspace_id' => $workspace->id]);

    $response = actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('currentWorkspace')
        ->where('currentWorkspace.id', $workspace->id)
        ->where('currentWorkspace.name', $workspace->name)
    );
});

it('shares workspaces list with inertia', function () {
    $user = User::factory()->withoutTwoFactor()->create(['onboarded_at' => now()]);
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);
    $user->update(['current_workspace_id' => $workspace->id]);

    $response = actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('workspaces', 1)
    );
});

it('shares flash messages with inertia', function () {
    $user = User::factory()->withoutTwoFactor()->create(['onboarded_at' => now()]);
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);
    $user->update(['current_workspace_id' => $workspace->id]);

    $response = actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('flash')
        ->has('flash.success')
    );
});

it('shares null auth user for guests', function () {
    $response = get('/login');

    $response->assertInertia(fn ($page) => $page
        ->where('auth.user', null)
    );
});

it('shares app name', function () {
    $user = User::factory()->withoutTwoFactor()->create(['onboarded_at' => now()]);
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);
    $user->update(['current_workspace_id' => $workspace->id]);

    $response = actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('name')
        ->where('name', config('app.name'))
    );
});

it('shares locale', function () {
    $user = User::factory()->withoutTwoFactor()->create(['onboarded_at' => now()]);
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);
    $user->update(['current_workspace_id' => $workspace->id]);

    $response = actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('locale')
    );
});

it('shares impersonation status', function () {
    $user = User::factory()->withoutTwoFactor()->create(['onboarded_at' => now()]);
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);
    $user->update(['current_workspace_id' => $workspace->id]);

    $response = actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->where('auth.is_impersonating', false)
    );
});
