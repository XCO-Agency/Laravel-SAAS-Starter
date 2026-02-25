<?php

use App\Models\User;

it('redirects guests from admin audit logs', function () {
    $this->get('/admin/audit-logs')
        ->assertRedirect('/login');
});

it('forbids non-superadmin access to audit logs', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get('/admin/audit-logs')
        ->assertForbidden();
});

it('allows superadmin to view audit logs', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->get('/admin/audit-logs')
        ->assertSuccessful()
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('admin/audit-logs')
            ->has('activities')
            ->has('filters')
            ->has('logNames')
            ->has('events')
        );
});

it('supports search and filter query params', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->get('/admin/audit-logs?search=user&event=created&log_name=default')
        ->assertSuccessful()
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->where('filters.search', 'user')
            ->where('filters.event', 'created')
            ->where('filters.log_name', 'default')
        );
});
