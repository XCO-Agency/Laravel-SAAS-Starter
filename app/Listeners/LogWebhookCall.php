<?php

namespace App\Listeners;

use Spatie\WebhookServer\Events\WebhookCallSucceededEvent;
use Spatie\WebhookServer\Events\WebhookCallFailedEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\WebhookLog;

class LogWebhookCall implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the successful webhook call event.
     */
    public function handleSuccessfulCall(WebhookCallSucceededEvent $event): void
    {
        $meta = $event->meta ?? [];

        WebhookLog::create([
            'workspace_id' => $meta['workspace_id'] ?? null,
            'webhook_endpoint_id' => $meta['webhook_endpoint_id'] ?? null,
            'event_type' => $meta['event_type'] ?? 'unknown',
            'url' => $event->webhookUrl,
            'status' => $event->response?->getStatusCode(),
            'payload' => $event->payload,
            'response' => $event->response?->getBody()?->getContents(),
        ]);
    }

    /**
     * Handle the failed webhook call event.
     */
    public function handleFailedCall(WebhookCallFailedEvent $event): void
    {
        $meta = $event->meta ?? [];

        WebhookLog::create([
            'workspace_id' => $meta['workspace_id'] ?? null,
            'webhook_endpoint_id' => $meta['webhook_endpoint_id'] ?? null,
            'event_type' => $meta['event_type'] ?? 'unknown',
            'url' => $event->webhookUrl,
            'status' => $event->response?->getStatusCode(),
            'payload' => $event->payload,
            'response' => $event->response?->getBody()?->getContents(),
            'error' => $event->errorMessage ?? 'Unknown Error',
        ]);
    }
}
