<?php

use App\Models\User;

use function Pest\Laravel\actingAs;

it('redirects superadmins without 2fa to the enforcement wall', function () {
    $user = User::factory()->create([
        'is_superadmin' => true,
        'two_factor_secret' => null,
        'two_factor_confirmed_at' => null,
    ]);

    actingAs($user)
        ->get('/admin/dashboard')
        ->assertRedirect(route('admin.2fa-required'));
});

it('allows superadmins with 2fa to access the dashboard', function () {
    $user = User::factory()->create([
        'is_superadmin' => true,
        'two_factor_secret' => 'secret',
        'two_factor_confirmed_at' => now(),
    ]);

    actingAs($user)
        ->get('/admin/dashboard')
        ->assertOk();
});

it('allows superadmins to view the enforcement wall', function () {
    $user = User::factory()->create(['is_superadmin' => true]);

    actingAs($user)
        ->get('/admin/2fa-required')
        ->assertOk();
});

it('blocks regular users entirely from admin area', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    actingAs($user)
        ->get('/admin/dashboard')
        ->assertForbidden();
});
