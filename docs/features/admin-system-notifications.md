# Admin System Notifications

## Overview

The Admin System Notifications feature provides superadmins with a centralized view of system-wide alerts and events. Notifications are automatically generated for important events like webhook failures, subscription changes, system errors, and new user signups.

## Features

- **Notification Types**: Webhook failures, subscription cancellations, past-due subscriptions, system errors, and new signups
- **Severity Levels**: Info, warning, and critical — each with distinct visual indicators
- **Filtering**: Filter by type, severity, or read/unread status
- **Bulk Actions**: Mark all notifications as read at once
- **Summary Cards**: At-a-glance counts for total, unread, critical, and warning notifications
- **Pagination**: Server-side pagination (20 per page)

## Architecture

### Backend

- **Model**: `App\Models\AdminNotification` — stores notification data with type, severity, title, message, optional metadata, and read timestamp
- **Service**: `App\Services\AdminNotificationService` — provides helper methods for creating notifications programmatically
- **Controller**: `App\Http\Controllers\Admin\AdminNotificationController` — handles listing, filtering, marking as read, and deletion

### Routes

| Method | URI | Action |
|--------|-----|--------|
| GET | `/admin/system-notifications` | List notifications |
| PATCH | `/admin/system-notifications/{id}/read` | Mark single as read |
| PATCH | `/admin/system-notifications/read-all` | Mark all as read |
| DELETE | `/admin/system-notifications/{id}` | Delete notification |

### Frontend

- **Page**: `resources/js/pages/admin/system-notifications.tsx`
- Summary cards with KPI counts
- Filterable notification list with severity badges and type labels
- Mark as read and delete actions per notification

## Usage

### Creating Notifications Programmatically

```php
use App\Services\AdminNotificationService;

$service = app(AdminNotificationService::class);

// Webhook failure
$service->webhookFailed('https://example.com/webhook', 'Connection timeout');

// Subscription canceled
$service->subscriptionCanceled('Acme Corp', 'Pro');

// Subscription past due
$service->subscriptionPastDue('Acme Corp', 'Business');

// System error
$service->systemError('Queue failure', 'Redis connection lost', ['queue' => 'emails']);

// New signup
$service->newSignup('Jane Doe', 'jane@example.com');
```

## Testing

```bash
php artisan test --compact tests/Feature/Admin/AdminSystemNotificationsTest.php
```

19 tests, 160 assertions covering:
- Page rendering and authorization
- Filtering by type, severity, and read status
- Mark as read (single and bulk)
- Delete notification
- Summary counts
- Pagination and ordering
- Service convenience methods
- Non-admin access denial
