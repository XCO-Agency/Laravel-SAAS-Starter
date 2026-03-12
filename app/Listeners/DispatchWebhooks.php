<?php

namespace App\Listeners;

use App\Models\WebhookEndpoint;
use Spatie\WebhookServer\WebhookCall;

class DispatchWebhooks
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        // Extract workspace and payload based on event type
        $workspace = null;
        $payload = ['event' => class_basename($event)];

        if (property_exists($event, 'workspace')) {
            $workspace = $event->workspace;
        } elseif (method_exists($event, 'getWorkspace')) {
            $workspace = $event->getWorkspace();
        }

        if (! $workspace) {
            return;
        }

        // Add model to payload if it's a standard event
        foreach (['user', 'member', 'invitation'] as $prop) {
            if (property_exists($event, $prop)) {
                $payload[$prop] = $event->$prop->toArray();
            }
        }

        $endpoints = WebhookEndpoint::where('workspace_id', $workspace->id)
            ->where('is_active', true)
            ->get();

        foreach ($endpoints as $endpoint) {
            // Check if endpoint is subscribed to this event type
            if (! empty($endpoint->events) && ! in_array(class_basename($event), $endpoint->events)) {
                continue;
            }

            WebhookCall::create()
                ->url($endpoint->url)
                ->payload($payload)
                ->useSecret($endpoint->secret)
                ->meta([
                    'workspace_id' => $workspace->id,
                    'webhook_endpoint_id' => $endpoint->id,
                    'event_type' => class_basename($event),
                ])
                ->dispatch();
        }
    }
}
