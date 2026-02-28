# Real-time Notifications

The application integrates **Laravel Reverb** for real-time, WebSocket-based notifications and activity updates.

## Architecture

- **Server**: Laravel Reverb (high-performance WebSocket server).
- **Frontend**: `@laravel/echo-react` with `configureEcho` + Pusher-JS transport.
- **Events**: Server-side events implement the `ShouldBroadcast` interface.

## Core Components

### 1. Workspace Activity Event

The `WorkspaceActivityWasLogged` event is triggered whenever an important action occurs within a workspace.

```php
// app/Events/WorkspaceActivityWasLogged.php
public function broadcastOn(): array
{
    return [
        new PrivateChannel('workspace.' . $this->workspace->id),
    ];
}

public function broadcastAs(): string
{
    return 'workspace.activity';
}
```

### 2. Activity Observer

The `ActivityLogObserver` automatically dispatches the broadcast event whenever a new `Activity` model is created by `spatie/laravel-activitylog`.

### 3. Frontend Integration

The `resources/js/layouts/app-layout.tsx` listens for workspace activity using the `useEcho` hook:

```typescript
import { useEcho } from '@laravel/echo-react';

useEcho(
    currentWorkspace ? `workspace.${currentWorkspace.id}` : null,
    '.workspace.activity',
    (e: { message: string; type: 'success' | 'error' | 'info' }) => {
        addToast(e.message, e.type);
    },
);
```

### 4. Channel Authorization

Private channels are authorized in `routes/channels.php`:

```php
Broadcast::channel('workspace.{id}', function ($user, $id) {
    return $user->belongsToWorkspace(Workspace::find($id));
});
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

> If `VITE_REVERB_APP_KEY` is not set, Echo will not initialize — the app still works but without real-time features.

### Generate Credentials

You can generate fresh Reverb credentials by running:

```bash
php artisan reverb:install
```

## Local Development

The `composer run dev` script starts all services including Reverb automatically:

```bash
composer run dev
```

This starts: web server, queue worker, log tail, Vite, and Reverb.

To start Reverb manually:

```bash
php artisan reverb:start
```

Add `--debug` to see WebSocket traffic:

```bash
php artisan reverb:start --debug
```

## Production Deployment

### Docker / Coolify

The `entrypoint.sh` starts Reverb automatically alongside Octane and the queue worker:

```sh
php artisan reverb:start --host=0.0.0.0 --port=8080 &
```

### Production Environment Variables

In production, update these values to match your domain:

```env
REVERB_HOST="your-domain.com"
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### Reverse Proxy (Nginx)

If running behind Nginx, configure a reverse proxy for WebSocket traffic:

```nginx
location /app {
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header Scheme $scheme;
    proxy_set_header SERVER_PORT $server_port;
    proxy_set_header REMOTE_ADDR $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";

    proxy_pass http://0.0.0.0:8080;
}
```

> Reverb listens for WebSocket connections at `/app` and handles API requests at `/apps`. Ensure both URIs are proxied.

## Testing

Broadcasting tests are in `tests/Feature/Broadcasting/WorkspaceActivityBroadcastingTest.php`. Run with:

```bash
php artisan test --filter=WorkspaceActivityBroadcasting
```
