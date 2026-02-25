<?php

use App\Models\User;
use App\Models\Workspace;

it('redirects guests from admin workspaces', function () {
    $this->get('/admin/workspaces')
        ->assertRedirect('/login');
});

it('forbids non-superadmin access to admin workspaces', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get('/admin/workspaces')
        ->assertForbidden();
});

it('allows superadmin to view all workspaces', function () {
    Workspace::factory()->count(3)->create();

    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->get('/admin/workspaces')
        ->assertSuccessful()
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('admin/workspaces')
            ->has('workspaces')
            ->has('filters')
            ->has('planOptions')
        );
});

it('can search workspaces by name', function () {
    Workspace::factory()->create(['name' => 'Alpha Team']);
    Workspace::factory()->create(['name' => 'Beta Corp']);

    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->get('/admin/workspaces?search=Alpha')
        ->assertSuccessful()
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('admin/workspaces')
            ->where('filters.search', 'Alpha')
        );
});
