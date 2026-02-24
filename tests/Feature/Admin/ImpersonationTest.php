<?php

use App\Models\User;

it('forbids non-superadmins from impersonating', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.impersonate', $target))
        ->assertForbidden(); // Standard user gets 403
});

it('allows superadmins to impersonate users', function () {
    $superadmin = User::factory()->superadmin()->create();
    $target = User::factory()->create();

    $this->actingAs($superadmin)
        ->post(route('admin.impersonate', $target))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHas('impersonated_by', $superadmin->id);

    expect(auth()->id())->toBe($target->id);
});

it('prevents superadmins from impersonating themselves', function () {
    $superadmin = User::factory()->superadmin()->create();

    $this->actingAs($superadmin)
        ->post(route('admin.impersonate', $superadmin))
        ->assertRedirect()
        ->assertSessionHas('error', 'You cannot impersonate yourself.');
});

it('allows leaving impersonation and restores original user', function () {
    $superadmin = User::factory()->superadmin()->create();
    $target = User::factory()->create();

    // Simulate clicking "Leave Impersonation" while currently logged in as $target
    $this->actingAs($target)
        ->withSession(['impersonated_by' => $superadmin->id])
        ->post(route('admin.impersonate.leave'))
        ->assertRedirect(route('admin.dashboard'))
        ->assertSessionMissing('impersonated_by');

    // Verify authentication was swapped back natively
    expect(auth()->id())->toBe($superadmin->id);
});
