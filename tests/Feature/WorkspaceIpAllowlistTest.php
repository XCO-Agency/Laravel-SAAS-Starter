<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workspace;

function createWorkspaceForUser(User $user): Workspace
{
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user, ['role' => 'admin']);
    $user->switchWorkspace($workspace);
    return $workspace;
}

it('allows access when allowed_ips is null', function () {
    $user = User::factory()->create();
    $workspace = createWorkspaceForUser($user);

    expect($workspace->allowed_ips)->toBeNull();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk();
});

it('allows access when allowed_ips is empty array', function () {
    $user = User::factory()->create();
    $workspace = createWorkspaceForUser($user);
    $workspace->update(['allowed_ips' => []]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk();
});

it('blocks access with 403 when IP is not in allowed_ips', function () {
    $user = User::factory()->create();
    $workspace = createWorkspaceForUser($user);
    $workspace->update(['allowed_ips' => ['192.168.1.100']]); // Not localhost (127.0.0.1)

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertForbidden();
});

it('allows access when request IP matches allowed_ips', function () {
    $user = User::factory()->create();
    $workspace = createWorkspaceForUser($user);
    $workspace->update(['allowed_ips' => ['127.0.0.1', '192.168.1.100']]);

    $this->actingAs($user)
        ->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
        ->get('/dashboard')
        ->assertOk();
});

it('allows owner to update allowed_ips via security settings', function () {
    $user = User::factory()->create();
    createWorkspaceForUser($user);

    $this->actingAs($user)
        ->put('/settings/workspace-security', [
            'require_two_factor' => false,
            'allowed_ips' => '10.0.0.1, 10.0.0.2',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $workspace = $user->currentWorkspace->fresh();
    expect($workspace->allowed_ips)->toBe([
        '10.0.0.1',
        '10.0.0.2',
    ]);
});

it('validates allowed_ips must be valid IPs', function () {
    $user = User::factory()->create();
    createWorkspaceForUser($user);

    $this->actingAs($user)
        ->put('/settings/workspace-security', [
            'require_two_factor' => false,
            'allowed_ips' => '10.0.0.1, not-an-ip',
        ])
        ->assertSessionHasErrors('allowed_ips');
});

it('prevents non-owner from updating allowed_ips', function () {
    $owner = User::factory()->create();
    $workspace = createWorkspaceForUser($owner);

    $member = User::factory()->create();
    $workspace->users()->attach($member, ['role' => 'admin']);
    $member->switchWorkspace($workspace);

    $this->actingAs($member)
        ->put('/settings/workspace-security', [
            'require_two_factor' => false,
            'allowed_ips' => '10.0.0.1',
        ])
        ->assertForbidden();
});
