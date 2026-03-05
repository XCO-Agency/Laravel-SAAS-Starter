<?php

use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\Workspace;

it('belongs to a workspace', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $endpoint = WebhookEndpoint::factory()->create(['workspace_id' => $workspace->id]);

    expect($endpoint->workspace)->toBeInstanceOf(Workspace::class);
});

it('has many webhook logs', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $endpoint = WebhookEndpoint::factory()->create(['workspace_id' => $workspace->id]);

    expect($endpoint->webhookLogs)->toBeEmpty();
});

it('auto-generates secret on creation', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $endpoint = WebhookEndpoint::create([
        'workspace_id' => $workspace->id,
        'url' => 'https://example.com/webhook',
        'is_active' => true,
    ]);

    expect($endpoint->secret)->not->toBeNull();
    expect(strlen($endpoint->secret))->toBe(32);
});

it('preserves provided secret on creation', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $endpoint = WebhookEndpoint::create([
        'workspace_id' => $workspace->id,
        'url' => 'https://example.com/webhook',
        'secret' => 'custom-secret-key',
        'is_active' => true,
    ]);

    expect($endpoint->secret)->toBe('custom-secret-key');
});

it('casts events to array', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $endpoint = WebhookEndpoint::factory()->create([
        'workspace_id' => $workspace->id,
        'events' => ['WorkspaceMemberAdded', 'WorkspaceMemberRemoved'],
    ]);

    expect($endpoint->events)->toBeArray();
    expect($endpoint->events)->toContain('WorkspaceMemberAdded');
});

it('casts is_active to boolean', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    $endpoint = WebhookEndpoint::factory()->create([
        'workspace_id' => $workspace->id,
        'is_active' => 1,
    ]);

    expect($endpoint->is_active)->toBeTrue();
});
