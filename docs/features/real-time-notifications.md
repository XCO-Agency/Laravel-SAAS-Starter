# Real-time Notifications

The application integrates **Laravel Reverb** for real-time, WebSocket-based notifications and activity updates.

## Architecture

- **Server**: Laravel Reverb (high-performance WebSocket server).
- **Frontend**: Laravel Echo + Pusher-JS.
- **Events**: Server-side events implement the `ShouldBroadcast` interface.

## Core Components

### 1. Workspace Activity Event

The `WorkspaceActivityWasLogged` event is triggered whenever an important action occurs within a workspace.

```php
// app/Events/WorkspaceActivityWasLogged.php
public function broadcastOn(): array
{
    return [
        new PrivateChannel('workspaces.' . $this->activity->getExtraProperty('workspace_id')),
    ];
}
```

### 2. Activity Observer

The `ActivityLogObserver` automatically dispatches the broadcast event whenever a new `Activity` model is created by `spatie/laravel-activitylog`.

### 3. Frontend Integration

The `resources/js/layouts/app-layout.tsx` (and other main layouts) listens for notifications:

```typescript
useEffect(() => {
    if (user && workspace) {
        window.Echo.private(`workspaces.${workspace.id}`)
            .listen('WorkspaceActivityWasLogged', (e: any) => {
                toast(e.message, {
                    description: e.description,
                });
            });
    }
}, [user, workspace]);
```

## Configuration

Broadcasting is configured in `config/broadcasting.php`. In production, ensure the `REVERB_HOST` and `REVERB_PORT` are correctly set in your `.env`.

## Local Development

Start the Reverb server:

```bash
php artisan reverb:start
```

And the Vite development server to compile frontend assets:

```bash
npm run dev
```
