<?php

use App\Models\User;

it('blocks non-superadmin users from accessing user management', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $response = $this->actingAs($user)->get('/admin/users');

    $response->assertForbidden();
});

it('allows superadmins to view the user list', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    User::factory()->count(3)->create();

    $response = $this->actingAs($admin)->get('/admin/users');

    $response->assertOk();
});

it('supports searching users by name', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    User::factory()->create(['name' => 'Alice Wonderland']);
    User::factory()->create(['name' => 'Bob Builder']);

    $response = $this->actingAs($admin)->get('/admin/users?search=Alice');

    $response->assertOk();
});

it('supports searching users by email', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    User::factory()->create(['email' => 'findme@example.com']);

    $response = $this->actingAs($admin)->get('/admin/users?search=findme');

    $response->assertOk();
});

it('can promote a user to superadmin', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    $user = User::factory()->create(['is_superadmin' => false]);

    $response = $this->actingAs($admin)->put("/admin/users/{$user->id}", [
        'is_superadmin' => true,
    ]);

    $response->assertRedirect();
    expect($user->refresh()->is_superadmin)->toBeTrue();
});

it('can demote a user from superadmin', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    $user = User::factory()->create(['is_superadmin' => true]);

    $response = $this->actingAs($admin)->put("/admin/users/{$user->id}", [
        'is_superadmin' => false,
    ]);

    $response->assertRedirect();
    expect($user->refresh()->is_superadmin)->toBeFalse();
});

it('prevents self-demotion', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $response = $this->actingAs($admin)->put("/admin/users/{$admin->id}", [
        'is_superadmin' => false,
    ]);

    $response->assertSessionHasErrors('user');
    expect($admin->refresh()->is_superadmin)->toBeTrue();
});

it('can delete a user', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    $user = User::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/users/{$user->id}");

    $response->assertRedirect();
    expect(User::find($user->id))->toBeNull();
});

it('prevents self-deletion', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $response = $this->actingAs($admin)->delete("/admin/users/{$admin->id}");

    $response->assertSessionHasErrors('user');
    expect(User::find($admin->id))->not->toBeNull();
});
