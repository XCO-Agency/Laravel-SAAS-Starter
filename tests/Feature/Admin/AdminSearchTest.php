<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('requires authentication', function () {
    $this->getJson('/admin/search?q=test')->assertUnauthorized();
});

it('forbids non-superadmin users', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->getJson('/admin/search?q=test')
        ->assertForbidden();
});

it('returns empty results for queries shorter than 2 characters', function () {
    $this->actingAs($this->admin)
        ->getJson('/admin/search?q=a')
        ->assertOk()
        ->assertJson(['users' => [], 'workspaces' => [], 'subscriptions' => []]);
});

it('returns matching users by name', function () {
    User::factory()->create(['name' => 'Alice Smith', 'email' => 'alice@example.com']);
    User::factory()->create(['name' => 'Bob Jones', 'email' => 'bob@example.com']);

    $response = $this->actingAs($this->admin)
        ->getJson('/admin/search?q=Alice')
        ->assertOk();

    expect($response->json('users'))->toHaveCount(1);
    expect($response->json('users.0.name'))->toBe('Alice Smith');
});

it('returns matching users by email', function () {
    User::factory()->create(['name' => 'John Doe', 'email' => 'john@acme.com']);

    $response = $this->actingAs($this->admin)
        ->getJson('/admin/search?q=acme')
        ->assertOk();

    expect($response->json('users'))->toHaveCount(1);
    expect($response->json('users.0.email'))->toBe('john@acme.com');
});

it('returns matching workspaces by name', function () {
    $owner = User::factory()->create();
    Workspace::factory()->create(['owner_id' => $owner->id, 'name' => 'Acme Corp']);
    Workspace::factory()->create(['owner_id' => $owner->id, 'name' => 'Other Company']);

    $response = $this->actingAs($this->admin)
        ->getJson('/admin/search?q=Acme')
        ->assertOk();

    expect($response->json('workspaces'))->toHaveCount(1);
    expect($response->json('workspaces.0.name'))->toBe('Acme Corp');
});

it('returns matching workspaces by slug', function () {
    $owner = User::factory()->create();
    Workspace::factory()->create(['owner_id' => $owner->id, 'name' => 'My Company', 'slug' => 'my-acme-workspace']);

    $response = $this->actingAs($this->admin)
        ->getJson('/admin/search?q=acme-workspace')
        ->assertOk();

    expect($response->json('workspaces'))->toHaveCount(1);
    expect($response->json('workspaces.0.slug'))->toBe('my-acme-workspace');
});

it('returns the correct response structure', function () {
    $this->actingAs($this->admin)
        ->getJson('/admin/search?q=test')
        ->assertOk()
        ->assertJsonStructure(['users', 'workspaces', 'subscriptions']);
});

it('limits results to 5 per category', function () {
    User::factory()->count(10)->create(['name' => 'SearchableUser']);

    $response = $this->actingAs($this->admin)
        ->getJson('/admin/search?q=SearchableUser')
        ->assertOk();

    expect($response->json('users'))->toHaveCount(5);
});

it('includes user url in results', function () {
    $user = User::factory()->create(['name' => 'Searchable Person']);

    $response = $this->actingAs($this->admin)
        ->getJson('/admin/search?q=Searchable Person')
        ->assertOk();

    expect($response->json('users.0.url'))->toBe("/admin/users/{$user->id}");
});
