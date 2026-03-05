# Notification Delivery Analytics

## Overview

The Notification Delivery Analytics feature provides superadmins with a comprehensive dashboard to track per-channel delivery counts for email vs in-app notifications. This helps monitor the impact of user notification preferences and ensure reliable message delivery across the platform.

## Architecture

### Backend

- **Model:** `App\Models\NotificationDeliveryLog` — stores each delivery event with user, notification type, channel, category, and timestamp.
- **Listener:** `App\Listeners\LogNotificationDelivery` — listens to Laravel's `Illuminate\Notifications\Events\NotificationSent` event and records a log entry for every notification successfully delivered.
- **Controller:** `App\Http\Controllers\Admin\NotificationAnalyticsController` — aggregates delivery data into metrics, daily trends, type breakdowns, category breakdowns, and channel split percentages.
- **Migration:** `notification_delivery_logs` table with indexed columns for efficient querying.

### Frontend

- **Page:** `resources/js/pages/admin/notification-analytics.tsx` — React page with Inertia rendering.
- **Layout:** Accessible from the Admin Panel sidebar under "Notifications".

## Database Schema

| Column              | Type      | Description                                     |
|---------------------|-----------|-------------------------------------------------|
| `id`                | bigint    | Primary key                                     |
| `user_id`           | foreignId | The user the notification was delivered to       |
| `notification_type` | string    | Class basename of the notification (e.g., `DataExportCompleted`) |
| `channel`           | string    | Normalized channel: `email` or `in_app`         |
| `category`          | string?   | Optional category: `security`, `team`, `billing`, `marketing` |
| `is_successful`     | boolean   | Whether delivery was successful                 |
| `delivered_at`      | timestamp | When the notification was delivered              |

## Dashboard Metrics (30-day window)

1. **Key Metrics Cards:**
   - Total deliveries
   - Email deliveries (with % of total)
   - In-app deliveries (with % of total)
   - Week-over-week trend (% change)

2. **Daily Deliveries Chart (14 days):**
   - Stacked bar chart showing email vs in-app per day
   - Hover tooltips with exact counts

3. **Channel Distribution:**
   - Visual split bar showing email vs in-app ratio

4. **By Category:**
   - Horizontal bars grouped by notification category (security, team, billing, marketing)

5. **By Notification Type:**
   - Table with per-type email/in-app/total counts

## Channel Normalization

The listener normalizes Laravel channel names for consistent storage:
- `mail` → `email`
- `database` → `in_app`

## Category Mapping

Notification types are mapped to categories via `LogNotificationDelivery::$categoryMap`. New notification types can register their category using:

```php
LogNotificationDelivery::registerCategory(MyNotification::class, 'billing');
```

## Access Control

- Only superadmins (`is_superadmin = true`) can access the analytics page.
- Route: `GET /admin/notification-analytics`
- Named route: `admin.notification-analytics.index`

## Tests

9 Pest feature tests cover:
- Page renders for superadmins
- Non-admin access is forbidden
- Correct delivery counts by channel
- Deliveries grouped by notification type
- Channel split percentage calculation
- Category grouping
- Listener logs from `NotificationSent` event
- Listener normalizes `database` → `in_app`
- Old deliveries excluded from 30-day metrics

## Files

- `app/Models/NotificationDeliveryLog.php`
- `app/Listeners/LogNotificationDelivery.php`
- `app/Http/Controllers/Admin/NotificationAnalyticsController.php`
- `database/migrations/2026_03_05_211440_create_notification_delivery_logs_table.php`
- `resources/js/pages/admin/notification-analytics.tsx`
- `tests/Feature/Admin/NotificationAnalyticsTest.php`
