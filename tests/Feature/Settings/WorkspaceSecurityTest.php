<?php

use App\Models\User;
use App\Models\Workspace;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create([
        'owner_id' => $this->owner->id,
        'require_two_factor' => false,
    ]);
    $this->workspace->users()->attach($this->owner, ['role' => 'owner']);
    $this->owner->update(['current_workspace_id' => $this->workspace->id]);
});

it('allows owner to view the security settings page', function () {
    actingAs($this->owner)
        ->get('/settings/workspace-security')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/workspace-security')
            ->has('require_two_factor')
        );
});

it('allows owner to enable 2FA enforcement', function () {
    actingAs($this->owner)
        ->put('/settings/workspace-security', ['require_two_factor' => true])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($this->workspace->fresh()->require_two_factor)->toBeTrue();
});

it('allows owner to disable 2FA enforcement', function () {
    $this->workspace->update(['require_two_factor' => true]);

    actingAs($this->owner)
        ->put('/settings/workspace-security', ['require_two_factor' => false])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($this->workspace->fresh()->require_two_factor)->toBeFalse();
});

it('blocks non-owner from changing security settings', function () {
    $member = User::factory()->create();
    $this->workspace->users()->attach($member, ['role' => 'member']);
    $member->update(['current_workspace_id' => $this->workspace->id]);

    actingAs($member)
        ->put('/settings/workspace-security', ['require_two_factor' => true])
        ->assertForbidden();
});

it('redirects members without 2FA to the enforcement wall when required', function () {
    $this->workspace->update(['require_two_factor' => true]);

    $member = User::factory()->create([
        'two_factor_secret' => null,
        'two_factor_confirmed_at' => null,
    ]);
    $this->workspace->users()->attach($member, ['role' => 'member']);
    $member->update(['current_workspace_id' => $this->workspace->id]);

    actingAs($member)
        ->get('/dashboard')
        ->assertRedirect(route('workspace.2fa-required'));
});

it('allows members with 2FA to pass through when enforcement is on', function () {
    $this->workspace->update(['require_two_factor' => true]);

    // Owner already has 2FA (simulate by setting confirmed_at)
    $this->owner->update([
        'two_factor_secret' => encrypt('JBSWY3DPEHPK3PXP'),
        'two_factor_confirmed_at' => now(),
    ]);

    actingAs($this->owner)
        ->get('/dashboard')
        ->assertOk();
});

it('allows access when workspace does not require 2FA', function () {
    $member = User::factory()->create([
        'two_factor_secret' => null,
        'two_factor_confirmed_at' => null,
    ]);
    $this->workspace->users()->attach($member, ['role' => 'member']);
    $member->update(['current_workspace_id' => $this->workspace->id]);

    actingAs($member)->get('/dashboard')->assertOk();
});

it('never blocks the workspace owner who lacks 2FA', function () {
    $this->workspace->update(['require_two_factor' => true]);

    $this->owner->update([
        'two_factor_secret' => null,
        'two_factor_confirmed_at' => null,
    ]);

    // Owner must always be able to reach settings and disable the policy
    actingAs($this->owner)->get('/dashboard')->assertOk();
});

it('passes workspace name to the enforcement wall page', function () {
    $this->workspace->update(['require_two_factor' => true]);

    $member = User::factory()->create([
        'two_factor_secret' => null,
        'two_factor_confirmed_at' => null,
    ]);
    $this->workspace->users()->attach($member, ['role' => 'member']);
    $member->update(['current_workspace_id' => $this->workspace->id]);

    actingAs($member)
        ->get('/workspace/2fa-required')
        ->assertInertia(fn ($page) => $page
            ->component('workspace-2fa-required')
            ->has('workspace_name')
            ->has('workspaces')
        );
});
