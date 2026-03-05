<?php

use App\Listeners\LogWebhookCall;
use App\Models\WebhookLog;
use App\Models\Workspace;
use Spatie\WebhookServer\Events\WebhookCallFailedEvent;
use Spatie\WebhookServer\Events\WebhookCallSucceededEvent;

function makeSucceededEvent(array $overrides = []): WebhookCallSucceededEvent
{
    $defaults = [
        'httpVerb' => 'post',
        'webhookUrl' => 'https://example.com/webhook',
        'payload' => ['event' => 'test.created', 'data' => ['id' => 1]],
        'headers' => ['Content-Type' => 'application/json'],
        'meta' => [],
        'tags' => [],
        'attempt' => 1,
        'response' => null,
        'errorType' => null,
        'errorMessage' => null,
        'uuid' => 'test-uuid',
        'transferStats' => null,
    ];

    $params = array_merge($defaults, $overrides);

    return new WebhookCallSucceededEvent(
        $params['httpVerb'],
        $params['webhookUrl'],
        $params['payload'],
        $params['headers'],
        $params['meta'],
        $params['tags'],
        $params['attempt'],
        $params['response'],
        $params['errorType'],
        $params['errorMessage'],
        $params['uuid'],
        $params['transferStats'],
    );
}

function makeFailedEvent(array $overrides = []): WebhookCallFailedEvent
{
    $defaults = [
        'httpVerb' => 'post',
        'webhookUrl' => 'https://example.com/webhook',
        'payload' => ['event' => 'test.failed'],
        'headers' => ['Content-Type' => 'application/json'],
        'meta' => [],
        'tags' => [],
        'attempt' => 1,
        'response' => null,
        'errorType' => null,
        'errorMessage' => null,
        'uuid' => 'test-uuid',
        'transferStats' => null,
    ];

    $params = array_merge($defaults, $overrides);

    return new WebhookCallFailedEvent(
        $params['httpVerb'],
        $params['webhookUrl'],
        $params['payload'],
        $params['headers'],
        $params['meta'],
        $params['tags'],
        $params['attempt'],
        $params['response'],
        $params['errorType'],
        $params['errorMessage'],
        $params['uuid'],
        $params['transferStats'],
    );
}

it('logs a successful webhook call', function () {
    $workspace = Workspace::factory()->create();

    $event = makeSucceededEvent([
        'meta' => [
            'workspace_id' => $workspace->id,
            'event_type' => 'test.created',
        ],
    ]);

    $listener = new LogWebhookCall;
    $listener->handleSuccessfulCall($event);

    $log = WebhookLog::first();

    expect($log)->not->toBeNull()
        ->and($log->workspace_id)->toBe($workspace->id)
        ->and($log->event_type)->toBe('test.created')
        ->and($log->url)->toBe('https://example.com/webhook')
        ->and($log->payload)->toBe(['event' => 'test.created', 'data' => ['id' => 1]])
        ->and($log->error)->toBeNull();
});

it('logs a failed webhook call with error message', function () {
    $workspace = Workspace::factory()->create();

    $event = makeFailedEvent([
        'meta' => [
            'workspace_id' => $workspace->id,
            'event_type' => 'test.failed',
        ],
        'errorMessage' => 'Connection timed out',
    ]);

    $listener = new LogWebhookCall;
    $listener->handleFailedCall($event);

    $log = WebhookLog::first();

    expect($log)->not->toBeNull()
        ->and($log->event_type)->toBe('test.failed')
        ->and($log->error)->toBe('Connection timed out');
});

it('handles empty meta gracefully by using provided workspace_id', function () {
    $workspace = Workspace::factory()->create();

    $event = makeSucceededEvent([
        'meta' => [
            'workspace_id' => $workspace->id,
        ],
    ]);

    $listener = new LogWebhookCall;
    $listener->handleSuccessfulCall($event);

    $log = WebhookLog::first();

    expect($log)->not->toBeNull()
        ->and($log->workspace_id)->toBe($workspace->id)
        ->and($log->webhook_endpoint_id)->toBeNull()
        ->and($log->event_type)->toBe('unknown');
});

it('defaults error to unknown error when not provided', function () {
    $workspace = Workspace::factory()->create();

    $event = makeFailedEvent([
        'meta' => [
            'workspace_id' => $workspace->id,
        ],
        'errorMessage' => null,
    ]);

    $listener = new LogWebhookCall;
    $listener->handleFailedCall($event);

    $log = WebhookLog::first();

    expect($log->error)->toBe('Unknown Error');
});
