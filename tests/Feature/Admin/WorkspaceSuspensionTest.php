<?php

use App\Models\User;
use App\Models\Workspace;

test('superadmin can suspend a workspace', function () {
    $superadmin = User::factory()->superadmin()->create();
    $workspace = Workspace::factory()->create();

    $this->actingAs($superadmin)
        ->post(route('admin.workspaces.suspend', $workspace), [
            'reason' => 'Violation of terms',
        ])
        ->assertRedirect();

    expect($workspace->fresh()->suspended_at)->not->toBeNull()
        ->and($workspace->fresh()->suspension_reason)->toBe('Violation of terms');
});

test('superadmin can unsuspend a workspace', function () {
    $superadmin = User::factory()->superadmin()->create();
    $workspace = Workspace::factory()->create([
        'suspended_at' => now(),
        'suspension_reason' => 'Violation of terms',
    ]);

    $this->actingAs($superadmin)
        ->post(route('admin.workspaces.unsuspend', $workspace))
        ->assertRedirect();

    expect($workspace->fresh()->suspended_at)->toBeNull()
        ->and($workspace->fresh()->suspension_reason)->toBeNull();
});

test('non-superadmin cannot suspend or unsuspend workspaces', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.workspaces.suspend', $workspace), [
            'reason' => 'Violation',
        ])
        ->assertForbidden();

    expect($workspace->fresh()->suspended_at)->toBeNull();

    $suspendedWorkspace = Workspace::factory()->create(['suspended_at' => now()]);

    $this->actingAs($user)
        ->post(route('admin.workspaces.unsuspend', $suspendedWorkspace))
        ->assertForbidden();

    expect($suspendedWorkspace->fresh()->suspended_at)->not->toBeNull();
});

test('suspended workspace blocks access to standard routes', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'suspended_at' => now(),
        'suspension_reason' => 'Non-payment',
    ]);

    // Switch to the suspended workspace
    $user->switchWorkspace($workspace);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertForbidden()
        ->assertInertia(
            fn($page) => $page
                ->component('workspace-suspended')
                ->has('workspace.suspended_at')
                ->where('workspace.suspension_reason', 'Non-payment')
        );
});

test('suspended workspace allows access to allowed routes', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'suspended_at' => now(),
    ]);
    $user->switchWorkspace($workspace);

    $this->withoutExceptionHandling();
    $response = $this->actingAs($user)
        ->get(route('workspaces.index'));

    $response->assertOk();

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk(); // Profile edit does not use workspace middleware
});
