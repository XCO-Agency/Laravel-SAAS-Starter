<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

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
        ->assertInertia(fn (AssertableInertia $page) => $page
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
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('filters.search', 'user')
            ->where('filters.event', 'created')
            ->where('filters.log_name', 'default')
        );
});

it('superadmin can export audit logs as csv', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    activity()->log('Test export entry');

    $this->actingAs($admin)
        ->get('/admin/audit-logs/export')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

it('csv export contains audit log headers', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $response = $this->actingAs($admin)->get('/admin/audit-logs/export');

    $response->assertOk();
    expect($response->streamedContent())->toContain('ID')
        ->and($response->streamedContent())->toContain('Description')
        ->and($response->streamedContent())->toContain('Event')
        ->and($response->streamedContent())->toContain('Causer');
});

it('non-superadmin cannot export audit logs', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)->get('/admin/audit-logs/export')->assertForbidden();
});
