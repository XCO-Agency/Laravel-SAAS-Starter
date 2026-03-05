<?php

use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->withoutTwoFactor()->create(['is_superadmin' => true]);
});

it('renders the scheduled tasks page for superadmin', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.scheduled-tasks.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/scheduled-tasks')
            ->has('tasks')
        );
});

it('denies access to non-superadmin users', function () {
    $user = User::factory()->withoutTwoFactor()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get(route('admin.scheduled-tasks.index'))
        ->assertForbidden();
});
