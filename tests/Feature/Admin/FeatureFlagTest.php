<?php

use App\Models\FeatureFlag;
use App\Models\User;
use App\Models\Workspace;

it('redirects guests from admin feature flags', function () {
    $this->get('/admin/feature-flags')
        ->assertRedirect('/login');
});

it('forbids non-superadmin access to feature flags', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get('/admin/feature-flags')
        ->assertForbidden();
});

it('allows superadmin to view feature flags', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->get('/admin/feature-flags')
        ->assertSuccessful()
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('admin/feature-flags')
            ->has('flags')
            ->has('workspaces')
        );
});

it('allows superadmin to create feature flag', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    $workspace = Workspace::factory()->create();

    $this->actingAs($admin)
        ->post('/admin/feature-flags', [
            'key' => 'ai-chat',
            'name' => 'AI Chat Assistant',
            'description' => 'Enables the AI chat assistant',
            'is_global' => false,
            'workspace_ids' => [$workspace->id],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('feature_flags', [
        'key' => 'ai-chat',
        'is_global' => false,
    ]);

    expect(FeatureFlag::first()->workspace_ids)->toContain($workspace->id);
});

it('validates feature flag uniqueness', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    FeatureFlag::create([
        'key' => 'existing-flag',
        'name' => 'Existing',
        'is_global' => true,
    ]);

    $this->actingAs($admin)
        ->post('/admin/feature-flags', [
            'key' => 'existing-flag',
            'name' => 'New Flag',
            'is_global' => true,
        ])
        ->assertSessionHasErrors(['key']);
});

it('allows superadmin to delete feature flag', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    $flag = FeatureFlag::create([
        'key' => 'to-delete',
        'name' => 'To Delete',
        'is_global' => true,
    ]);

    $this->actingAs($admin)
        ->delete("/admin/feature-flags/{$flag->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('feature_flags', ['id' => $flag->id]);
});

it('resolves feature flags via Workspace trait correctly', function () {
    $workspace1 = Workspace::factory()->create();
    $workspace2 = Workspace::factory()->create();

    // Global flag
    FeatureFlag::create([
        'key' => 'global-flag',
        'name' => 'Global',
        'is_global' => true,
    ]);

    // Targeted flag
    FeatureFlag::create([
        'key' => 'targeted-flag',
        'name' => 'Targeted',
        'is_global' => false,
        'workspace_ids' => [$workspace1->id],
    ]);

    // W1 should have both
    expect($workspace1->features()->active('global-flag'))->toBeTrue();
    expect($workspace1->features()->active('targeted-flag'))->toBeTrue();
    expect(array_keys(array_filter($workspace1->features()->all())))->toContain('global-flag', 'targeted-flag');

    // W2 should only have global
    expect($workspace2->features()->active('global-flag'))->toBeTrue();
    expect($workspace2->features()->active('targeted-flag'))->toBeFalse();
    expect(array_keys(array_filter($workspace2->features()->all())))->toContain('global-flag');
    expect(array_keys(array_filter($workspace2->features()->all())))->not->toContain('targeted-flag');
});

it('shares feature_flags globally for the current workspace via Inertia', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);
    $workspace->users()->attach($user, ['role' => 'admin']);

    // Switch to this workspace
    $user->update(['current_workspace_id' => $workspace->id]);

    FeatureFlag::create([
        'key' => 'shared-flag',
        'name' => 'Shared',
        'is_global' => false,
        'workspace_ids' => [$workspace->id],
    ]);

    $this->actingAs($user)
        ->get('/settings/profile')
        ->assertSuccessful()
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->has('currentWorkspace.feature_flags')
            ->where('currentWorkspace.feature_flags.shared-flag', true)
        );
});
