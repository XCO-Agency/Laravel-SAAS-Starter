<?php

use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\WebhookLog;
use App\Models\Workspace;

it('uses UUIDs as primary key', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $endpoint = WebhookEndpoint::factory()->create(['workspace_id' => $workspace->id]);

    $log = WebhookLog::create([
        'workspace_id' => $workspace->id,
        'webhook_endpoint_id' => $endpoint->id,
        'event_type' => 'WorkspaceMemberAdded',
        'url' => 'https://example.com/webhook',
        'status' => 200,
        'payload' => ['event' => 'WorkspaceMemberAdded'],
    ]);

    expect($log->id)->toBeString();
    expect(strlen($log->id))->toBe(36); // UUID format
});

it('belongs to a workspace', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $endpoint = WebhookEndpoint::factory()->create(['workspace_id' => $workspace->id]);

    $log = WebhookLog::create([
        'workspace_id' => $workspace->id,
        'webhook_endpoint_id' => $endpoint->id,
        'event_type' => 'test',
        'url' => 'https://example.com',
        'status' => 200,
        'payload' => [],
    ]);

    expect($log->workspace)->toBeInstanceOf(Workspace::class);
});

it('belongs to a webhook endpoint', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $endpoint = WebhookEndpoint::factory()->create(['workspace_id' => $workspace->id]);

    $log = WebhookLog::create([
        'workspace_id' => $workspace->id,
        'webhook_endpoint_id' => $endpoint->id,
        'event_type' => 'test',
        'url' => 'https://example.com',
        'status' => 200,
        'payload' => [],
    ]);

    expect($log->webhookEndpoint)->toBeInstanceOf(WebhookEndpoint::class);
});

it('casts payload to array', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $endpoint = WebhookEndpoint::factory()->create(['workspace_id' => $workspace->id]);

    $log = WebhookLog::create([
        'workspace_id' => $workspace->id,
        'webhook_endpoint_id' => $endpoint->id,
        'event_type' => 'test',
        'url' => 'https://example.com',
        'status' => 200,
        'payload' => ['key' => 'value'],
    ]);

    expect($log->payload)->toBeArray();
    expect($log->payload['key'])->toBe('value');
});
