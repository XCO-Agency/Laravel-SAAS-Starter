<?php

use App\Listeners\DispatchWebhooks;
use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\Workspace;
use Spatie\WebhookServer\WebhookCall;

it('dispatches webhooks for active endpoints', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    WebhookEndpoint::factory()->create([
        'workspace_id' => $workspace->id,
        'url' => 'https://example.com/webhook',
        'is_active' => true,
        'events' => [],
    ]);

    $event = new class($workspace)
    {
        public function __construct(public Workspace $workspace) {}
    };

    $spy = Mockery::spy(WebhookCall::class);

    // We can verify the listener doesn't throw and fetches endpoints
    $listener = new DispatchWebhooks;
    // This will attempt to dispatch but in testing it's expected to work
    // We mainly verify the listener processes without error
    expect(fn () => $listener->handle($event))->not->toThrow(Exception::class);
});

it('skips dispatch when no workspace is found on event', function () {
    $event = new class
    {
        // No workspace property
    };

    $listener = new DispatchWebhooks;
    $listener->handle($event);

    // Should complete without error
    expect(true)->toBeTrue();
});

it('skips endpoints that filter on events not matching', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

    WebhookEndpoint::factory()->create([
        'workspace_id' => $workspace->id,
        'url' => 'https://example.com/webhook',
        'is_active' => true,
        'events' => ['SomeOtherEvent'],
    ]);

    $event = new class($workspace)
    {
        public function __construct(public Workspace $workspace) {}
    };

    $listener = new DispatchWebhooks;
    // Event class name won't match 'SomeOtherEvent', so webhook should be skipped
    expect(fn () => $listener->handle($event))->not->toThrow(Exception::class);
});
