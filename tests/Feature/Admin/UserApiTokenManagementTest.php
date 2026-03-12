<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
    $this->adminUser = User::factory()->create();
    $this->targetUser = User::factory()->create();
});

it('blocks non-superadmins from viewing user api tokens', function () {
    $this->actingAs($this->adminUser)
        ->get(route('admin.users.api-tokens.index', $this->targetUser))
        ->assertForbidden();
});

it('allows superadmins to view user api tokens', function () {
    $this->targetUser->createToken('Mobile App');

    $this->actingAs($this->superadmin)
        ->get(route('admin.users.api-tokens.index', $this->targetUser))
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/user-api-tokens')
            ->where('user.id', $this->targetUser->id)
            ->has('tokens', 1)
            ->where('tokens.0.name', 'Mobile App'));
});

it('allows superadmins to create api tokens for a user', function () {
    $this->actingAs($this->superadmin)
        ->post(route('admin.users.api-tokens.store', $this->targetUser), [
            'name' => 'CI Access',
        ])
        ->assertRedirect()
        ->assertSessionHas('token');

    expect($this->targetUser->fresh()->tokens()->count())->toBe(1)
        ->and($this->targetUser->fresh()->tokens()->first()->name)->toBe('CI Access');
});

it('blocks non-superadmins from creating api tokens for a user', function () {
    $this->actingAs($this->adminUser)
        ->post(route('admin.users.api-tokens.store', $this->targetUser), [
            'name' => 'Should Fail',
        ])
        ->assertForbidden();

    expect($this->targetUser->fresh()->tokens()->count())->toBe(0);
});

it('allows superadmins to revoke api tokens for a user', function () {
    $token = $this->targetUser->createToken('Temporary');

    $this->actingAs($this->superadmin)
        ->delete(route('admin.users.api-tokens.destroy', [$this->targetUser, $token->accessToken->id]))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($this->targetUser->fresh()->tokens()->count())->toBe(0);
});

it('does not revoke tokens that do not belong to the user route parameter', function () {
    $wrongUser = User::factory()->create();
    $token = $wrongUser->createToken('Wrong User Token');

    $this->actingAs($this->superadmin)
        ->delete(route('admin.users.api-tokens.destroy', [$this->targetUser, $token->accessToken->id]))
        ->assertRedirect();

    expect($wrongUser->fresh()->tokens()->count())->toBe(1)
        ->and($this->targetUser->fresh()->tokens()->count())->toBe(0);
});
