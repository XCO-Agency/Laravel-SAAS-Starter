<?php

use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\WebhookLog;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

test('a user with manage webhooks permission can browse webhook logs', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user, ['role' => 'admin']);
    $user->switchWorkspace($workspace);

    $endpoint = WebhookEndpoint::create([
        'workspace_id' => $workspace->id,
        'url' => 'https://example.com/webhooks',
        'secret' => 'test-secret',
        'is_active' => true,
    ]);

    WebhookLog::create([
        'workspace_id' => $workspace->id,
        'webhook_endpoint_id' => $endpoint->id,
        'url' => 'https://example.com/webhooks',
        'event_type' => 'test-event',
        'status' => 200,
        'payload' => ['foo' => 'bar'],
    ]);

    $response = $this->actingAs($user)->get(route('workspaces.webhooks.logs.index', $workspace));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('workspaces/webhooks/logs')
            ->has('logs.data', 1)
        );
});

test('a user without manage webhooks permission cannot browse webhook logs', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user, ['role' => 'member']);
    $user->switchWorkspace($workspace);

    $this->actingAs($user)
        ->get(route('workspaces.webhooks.logs.index', $workspace))
        ->assertForbidden();
});

test('users can only see logs from their own workspace', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user, ['role' => 'admin']);
    $user->switchWorkspace($workspace);

    $otherWorkspace = Workspace::factory()->create();
    
    WebhookLog::create([
        'workspace_id' => $otherWorkspace->id,
        'webhook_endpoint_id' => null,
        'url' => 'https://other.com',
        'event_type' => 'test-event',
        'status' => 200,
        'payload' => [],
    ]);

    $response = $this->actingAs($user)->get(route('workspaces.webhooks.logs.index', $workspace));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 0)
        );
});
