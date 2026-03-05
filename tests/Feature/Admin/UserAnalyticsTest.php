<?php

use App\Models\LoginActivity;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('displays user analytics page for superadmins', function () {
    $this->actingAs($this->admin)
        ->get('/admin/user-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/user-analytics')
            ->has('dailySignups')
            ->has('monthlyGrowth')
            ->has('activeUsers')
            ->has('retention')
            ->has('totalUsers')
            ->has('topDevices')
        );
});

it('shows correct total user count', function () {
    User::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get('/admin/user-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('totalUsers', 4) // 3 + admin
        );
});

it('calculates active users from login activity', function () {
    $user = User::factory()->create();

    LoginActivity::create([
        'user_id' => $user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Mozilla/5.0 (Macintosh)',
        'is_successful' => true,
        'login_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/user-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('activeUsers.today', 1)
            ->where('activeUsers.week', 1)
            ->where('activeUsers.month', 1)
        );
});

it('prevents non-admin access', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get('/admin/user-analytics')
        ->assertForbidden();
});
