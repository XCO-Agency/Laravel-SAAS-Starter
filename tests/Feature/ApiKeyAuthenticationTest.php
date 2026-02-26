<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceApiKey;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->addUser($this->user, 'owner');
});

it('authenticates with a valid API key', function () {
    $result = WorkspaceApiKey::generateKey($this->workspace, $this->user, 'Test Key', ['read']);

    $this->getJson('/api/v1/workspace', [
        'Authorization' => 'Bearer '.$result['plainTextKey'],
    ])->assertOk()
        ->assertJsonStructure(['id', 'name', 'slug', 'plan', 'created_at']);
});

it('rejects requests without an API key', function () {
    $this->getJson('/api/v1/workspace')
        ->assertUnauthorized()
        ->assertJson(['message' => 'Missing or invalid API key.']);
});

it('rejects requests with an invalid API key', function () {
    $this->getJson('/api/v1/workspace', [
        'Authorization' => 'Bearer wsk_invalidkeyhere',
    ])->assertUnauthorized()
        ->assertJson(['message' => 'Invalid API key.']);
});

it('rejects expired API keys', function () {
    $result = WorkspaceApiKey::generateKey(
        $this->workspace,
        $this->user,
        'Expired Key',
        ['read'],
        now()->subDay(),
    );

    $this->getJson('/api/v1/workspace', [
        'Authorization' => 'Bearer '.$result['plainTextKey'],
    ])->assertUnauthorized()
        ->assertJson(['message' => 'API key has expired.']);
});

it('rejects API keys without the required scope', function () {
    $result = WorkspaceApiKey::generateKey($this->workspace, $this->user, 'No Scope Key', ['webhooks']);

    $this->getJson('/api/v1/workspace', [
        'Authorization' => 'Bearer '.$result['plainTextKey'],
    ])->assertForbidden()
        ->assertJson(['message' => 'Insufficient scope.']);
});

it('updates last_used_at on successful authentication', function () {
    $result = WorkspaceApiKey::generateKey($this->workspace, $this->user, 'Usage Key', ['read']);

    expect($result['key']->last_used_at)->toBeNull();

    $this->getJson('/api/v1/workspace', [
        'Authorization' => 'Bearer '.$result['plainTextKey'],
    ])->assertOk();

    $result['key']->refresh();
    expect($result['key']->last_used_at)->not->toBeNull();
});

it('returns workspace members via the members endpoint', function () {
    $result = WorkspaceApiKey::generateKey($this->workspace, $this->user, 'Members Key', ['read']);

    $this->getJson('/api/v1/members', [
        'Authorization' => 'Bearer '.$result['plainTextKey'],
    ])->assertOk()
        ->assertJsonStructure(['members' => [['id', 'name', 'email', 'role']]]);
});

it('rejects non-bearer API keys', function () {
    $this->getJson('/api/v1/workspace', [
        'Authorization' => 'Basic dGVzdDp0ZXN0',
    ])->assertUnauthorized()
        ->assertJson(['message' => 'Missing or invalid API key.']);
});
