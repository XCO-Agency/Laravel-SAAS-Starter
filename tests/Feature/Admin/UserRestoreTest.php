<?php

use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
});

it('allows superadmin to restore a soft-deleted user', function () {
    $user = User::factory()->create();
    $userId = $user->id;
    $user->delete();

    expect(User::find($userId))->toBeNull();
    expect(User::onlyTrashed()->find($userId))->not->toBeNull();

    actingAs($this->superadmin)
        ->post("/admin/users/{$userId}/restore")
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(User::find($userId))->not->toBeNull();
});

it('returns 404 when restoring a non-trashed user', function () {
    $user = User::factory()->create();

    actingAs($this->superadmin)
        ->post("/admin/users/{$user->id}/restore")
        ->assertNotFound();
});

it('returns 404 when restoring a non-existent user', function () {
    actingAs($this->superadmin)
        ->post('/admin/users/99999/restore')
        ->assertNotFound();
});

it('blocks regular users from restoring users', function () {
    $user = User::factory()->create();
    $deleted = User::factory()->create();
    $deletedId = $deleted->id;
    $deleted->delete();

    actingAs($user)
        ->post("/admin/users/{$deletedId}/restore")
        ->assertForbidden();
});
