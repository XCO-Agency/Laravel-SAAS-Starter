<?php

use App\Models\LoginActivity;
use App\Models\User;

/**
 * @var \Tests\TestCase $this
 *
 * @property User $admin
 */
beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('renders the user analytics page for superadmin', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.user-analytics.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/user-analytics')
                ->has('dailySignups')
                ->has('monthlyGrowth')
                ->has('activeUsers')
                ->has('retention')
                ->has('totalUsers')
                ->has('topDevices')
        );
});

it('calculates active users correctly', function () {
    $user = User::factory()->create();
    LoginActivity::factory()->create([
        'user_id' => $user->id,
        'is_successful' => true,
        'login_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.user-analytics.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->where('activeUsers.today', 1)
        );
});

it('denies access to non-superadmin users', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get(route('admin.user-analytics.index'))
        ->assertForbidden();
});
