# Webhooks & Delivery Logs

The Webhooks feature allows your SaaS users (Workspace Administrators) to subscribe to system events taking place inside their workspaces. We integrate seamlessly with `spatie/laravel-webhook-server` for robust dispatching mechanisms.

## Core Features

- **Endpoint Registration**: Admins can configure secure HTTPS target URLs via the workspace settings dashboard.
- **Secret Signatures**: Laravel Webhook Server automatically uses cryptographic signatures enabling external platforms to verify payloads authentically originated from your infrastructure.
- **Live Event Logging**: Integrated `WebhookLog` schema meticulously tracks HTTP response codes, explicit JSON request bodies, and backend processing errors natively onto a beautiful inspection UI.
- **Testing Toolkit**: A convenient interactive "Ping" pipeline manually dispatches dummy messages verifying endpoints work flawlessly.

## Technical Implementation

### Models & Schema

- **WebhookEndpoint Model (`webhooks_endpoints` table)**
  Stores the `url`, the active toggles, and generated cryptogenic `secret` hashes for security validation checks.
- **WebhookLog Model (`webhook_logs` table)**
  Persists tracking meta. Driven globally by event listeners subscribing identically to the outgoing Spatie hooks in `AppServiceProvider`.

### Event Driven Subscriptions

Inside `WebhookEndpointController` (and anywhere else system webhooks are fired), the Spatie package is wrapped slightly to embed relational metadata for tracking via the `$event->meta` payload:

```php
WebhookCall::create()
    ->url($webhookEndpoint->url)
    ->payload([...data...])
    ->useSecret($webhookEndpoint->secret)
    ->meta([
        'workspace_id' => $workspace->id,
        'webhook_endpoint_id' => $webhookEndpoint->id,
        'event_type' => 'specific_event.fired',
    ])
    ->dispatch();
```

Behind the scenes, `App\Listeners\LogWebhookCall` safely ingests those meta payloads on both Succeeded and Failed transmission hooks directly mapped to the Workspace!

### UI Stack

Found natively at `resources/js/pages/workspaces/webhooks/` containing:

- `index.tsx` (Grid of endpoints, status indicators)
- `logs.tsx` (Deep-dive delivery diagnostics, JSON viewer modal overlay)
