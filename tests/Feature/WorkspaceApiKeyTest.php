<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceApiKey;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->member = User::factory()->create();

    $this->workspace = Workspace::factory()->create([
        'owner_id' => $this->owner->id,
    ]);

    $this->workspace->users()->attach($this->owner->id, ['role' => 'owner']);
    $this->workspace->users()->attach($this->member->id, ['role' => 'member']);

    $this->owner->switchWorkspace($this->workspace);
    $this->member->switchWorkspace($this->workspace);
});

it('allows workspace admin to view the api keys page', function () {
    actingAs($this->owner)
        ->get('/workspaces/api-keys')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('workspaces/api-keys')
            ->has('keys')
            ->has('availableScopes')
        );
});

it('allows members to view api keys page', function () {
    actingAs($this->member)
        ->get('/workspaces/api-keys')
        ->assertOk();
});

it('allows admin to create a workspace api key', function () {
    actingAs($this->owner)
        ->post('/workspaces/api-keys', [
            'name' => 'Production Key',
            'scopes' => ['read', 'write'],
            'expires_at' => '',
        ])
        ->assertRedirect()
        ->assertSessionHas('newKey');

    expect(WorkspaceApiKey::count())->toBe(1);
    expect(WorkspaceApiKey::first())
        ->name->toBe('Production Key')
        ->scopes->toBe(['read', 'write'])
        ->workspace_id->toBe($this->workspace->id);
});

it('stores the key hash and prefix correctly', function () {
    actingAs($this->owner)
        ->post('/workspaces/api-keys', [
            'name' => 'Hash Test',
            'scopes' => ['read'],
            'expires_at' => '',
        ])
        ->assertRedirect();

    $key = WorkspaceApiKey::first();
    expect($key->key_prefix)->toStartWith('wsk_');
    expect($key->key_hash)->toHaveLength(64);
});

it('prevents members from creating api keys', function () {
    actingAs($this->member)
        ->post('/workspaces/api-keys', [
            'name' => 'Unauthorized Key',
            'scopes' => ['read'],
            'expires_at' => '',
        ])
        ->assertForbidden();
});

it('validates required fields when creating', function () {
    actingAs($this->owner)
        ->post('/workspaces/api-keys', [
            'name' => '',
            'scopes' => ['invalid_scope'],
        ])
        ->assertSessionHasErrors(['name', 'scopes.0']);
});

it('allows admin to revoke a workspace api key', function () {
    $result = WorkspaceApiKey::generateKey($this->workspace, $this->owner, 'Temp Key', ['read']);

    actingAs($this->owner)
        ->delete("/workspaces/api-keys/{$result['key']->id}")
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(WorkspaceApiKey::count())->toBe(0);
});

it('prevents members from revoking api keys', function () {
    $result = WorkspaceApiKey::generateKey($this->workspace, $this->owner, 'Temp Key', ['read']);

    actingAs($this->member)
        ->delete("/workspaces/api-keys/{$result['key']->id}")
        ->assertForbidden();
});

it('detects expired keys correctly', function () {
    $key = WorkspaceApiKey::factory()->create([
        'workspace_id' => $this->workspace->id,
        'created_by' => $this->owner->id,
        'expires_at' => now()->subDay(),
    ]);

    expect($key->isExpired())->toBeTrue();

    $key->update(['expires_at' => now()->addDay()]);
    expect($key->fresh()->isExpired())->toBeFalse();
});
