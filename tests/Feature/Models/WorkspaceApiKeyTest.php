<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceApiKey;

test('it can generate a new api key', function () {
    $workspace = Workspace::factory()->create();
    $user = User::factory()->create();

    $result = WorkspaceApiKey::generateKey(
        $workspace,
        $user,
        'Production Key',
        ['read', 'write']
    );

    expect($result)->toHaveKeys(['key', 'plainTextKey']);
    expect($result['key'])->toBeInstanceOf(WorkspaceApiKey::class);
    expect($result['plainTextKey'])->toStartWith('wsk_');
    expect($result['key']->key_hash)->toBe(hash('sha256', $result['plainTextKey']));
    expect($result['key']->key_prefix)->toBe(substr($result['plainTextKey'], 0, 8));
    expect($result['key']->workspace_id)->toBe($workspace->id);
    expect($result['key']->created_by)->toBe($user->id);
});

test('it can check if a key is expired', function () {
    $key = WorkspaceApiKey::factory()->create(['expires_at' => now()->addDay()]);
    expect($key->isExpired())->toBeFalse();

    $expiredKey = WorkspaceApiKey::factory()->expired()->create();
    expect($expiredKey->isExpired())->toBeTrue();
});

test('it can check for scopes', function () {
    $key = WorkspaceApiKey::factory()->create(['scopes' => ['read', 'webhooks']]);

    expect($key->hasScope('read'))->toBeTrue();
    expect($key->hasScope('webhooks'))->toBeTrue();
    expect($key->hasScope('write'))->toBeFalse();
});

test('asterisk scope allows everything', function () {
    $key = WorkspaceApiKey::factory()->create(['scopes' => ['*']]);

    expect($key->hasScope('any-random-scope'))->toBeTrue();
});

test('it records usage', function () {
    $key = WorkspaceApiKey::factory()->create(['last_used_at' => null]);

    $key->recordUsage();

    expect($key->fresh()->last_used_at)->not->toBeNull();
});
