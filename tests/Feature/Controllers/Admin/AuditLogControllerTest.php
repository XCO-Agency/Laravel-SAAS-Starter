<?php

use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->withoutTwoFactor()->create(['is_superadmin' => true]);
});

it('renders the audit logs page for superadmin', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.audit-logs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/audit-logs')
            ->has('activities')
            ->has('filters')
            ->has('logNames')
            ->has('events')
        );
});

it('supports search filter', function () {
    activity()->log('Test activity log entry');

    $this->actingAs($this->admin)
        ->get(route('admin.audit-logs.index', ['search' => 'Test activity']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.search', 'Test activity')
        );
});

it('supports log_name filter', function () {
    activity('audit')->log('Audit entry');

    $this->actingAs($this->admin)
        ->get(route('admin.audit-logs.index', ['log_name' => 'audit']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.log_name', 'audit')
        );
});

it('supports event filter', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.audit-logs.index', ['event' => 'created']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.event', 'created')
        );
});

it('denies access to non-superadmin users', function () {
    $user = User::factory()->withoutTwoFactor()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get(route('admin.audit-logs.index'))
        ->assertForbidden();
});
