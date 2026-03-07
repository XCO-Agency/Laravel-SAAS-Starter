<?php

use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('renders the retention settings page for superadmin', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.retention.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/retention')
            ->has('policies')
        );
});

it('can run pruning as dry-run', function () {
    $this->actingAs($this->admin)
        ->postJson(route('admin.retention.prune'), ['dry_run' => true])
        ->assertOk()
        ->assertJson([
            'success' => true,
            'dry_run' => true,
        ]);
});

it('can run actual pruning', function () {
    $this->actingAs($this->admin)
        ->postJson(route('admin.retention.prune'), ['dry_run' => false])
        ->assertOk()
        ->assertJson([
            'success' => true,
            'dry_run' => false,
        ]);
});

it('denies access to non-superadmin users', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get(route('admin.retention.index'))
        ->assertForbidden();
});
