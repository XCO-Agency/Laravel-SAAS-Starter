<?php

use App\Models\FeatureFlag;
use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('renders the feature flags page for superadmin', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.feature-flags.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/feature-flags')
            ->has('flags')
            ->has('workspaces')
        );
});

it('can create a feature flag', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.feature-flags.store'), [
            'key' => 'new-dashboard',
            'name' => 'New Dashboard',
            'description' => 'Enable the new dashboard UI.',
            'is_global' => true,
            'workspace_ids' => [],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('feature_flags', [
        'key' => 'new-dashboard',
        'name' => 'New Dashboard',
        'is_global' => true,
    ]);
});

it('can create a feature flag with specific workspace ids', function () {
    $workspace = Workspace::factory()->create(['owner_id' => $this->admin->id]);

    $this->actingAs($this->admin)
        ->post(route('admin.feature-flags.store'), [
            'key' => 'workspace-feature',
            'name' => 'Workspace Feature',
            'is_global' => false,
            'workspace_ids' => [$workspace->id],
        ])
        ->assertRedirect();

    $flag = FeatureFlag::where('key', 'workspace-feature')->first();
    expect($flag->workspace_ids)->toContain($workspace->id);
});

it('can update a feature flag', function () {
    $flag = FeatureFlag::factory()->create([
        'key' => 'old-key',
        'name' => 'Old Name',
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.feature-flags.update', $flag), [
            'key' => 'updated-key',
            'name' => 'Updated Name',
            'is_global' => false,
            'workspace_ids' => [],
        ])
        ->assertRedirect();

    expect($flag->fresh()->name)->toBe('Updated Name');
    expect($flag->fresh()->key)->toBe('updated-key');
});

it('can delete a feature flag', function () {
    $flag = FeatureFlag::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('admin.feature-flags.destroy', $flag))
        ->assertRedirect();

    $this->assertDatabaseMissing('feature_flags', ['id' => $flag->id]);
});

it('validates key uniqueness on store', function () {
    FeatureFlag::factory()->create(['key' => 'existing-key']);

    $this->actingAs($this->admin)
        ->post(route('admin.feature-flags.store'), [
            'key' => 'existing-key',
            'name' => 'Duplicate',
            'is_global' => false,
        ])
        ->assertSessionHasErrors('key');
});

it('validates required fields on store', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.feature-flags.store'), [])
        ->assertSessionHasErrors(['key', 'name']);
});

it('denies access to non-superadmin users', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get(route('admin.feature-flags.index'))
        ->assertForbidden();
});
