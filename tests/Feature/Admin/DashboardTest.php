<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('redirects guests to login when accessing admin dashboard', function () {
    $response = $this->get('/admin/dashboard');

    $response->assertRedirect('/login');
});

it('aborts with 403 when a standard user accesses admin dashboard', function () {
    $user = User::factory()->create([
        'is_superadmin' => false,
    ]);

    $this->actingAs($user);

    $response = $this->get('/admin/dashboard');

    $response->assertForbidden();
});

it('allows superadmins to access the dashboard and see system metrics', function () {
    // Create some dummy data to count
    User::factory()->count(3)->create();
    Workspace::factory()->count(2)->create();

    $superadmin = User::factory()->create([
        'is_superadmin' => true,
    ]);

    $this->actingAs($superadmin);

    $response = $this->get('/admin/dashboard');

    $response->assertSuccessful();

    // In an Inertia test, you can test the Inertia page and passed props
    $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
        ->component('admin/dashboard')
        ->has('metrics', fn (\Inertia\Testing\AssertableInertia $metrics) => $metrics
            ->where('total_users', User::count())
            ->where('total_workspaces', Workspace::count())
        )
    );
});
