# Billing Reminder Notifications

## Overview

Billing Reminder Notifications proactively alert workspace owners about upcoming billing events — trial expirations and subscription endings. This helps reduce involuntary churn and keeps users informed about their billing status.

## Reminder Types

### Trial Ending

Sent when a workspace's trial period expires within the next **3 days**. The notification encourages the owner to upgrade before they lose access to premium features.

### Subscription Renewal / Expiration

Sent when a cancelled subscription's remaining access period ends within the next **7 days**. The notification reminds the owner to resubscribe if they wish to continue using paid features.

## How It Works

### Scheduled Command

The `app:send-billing-reminders` Artisan command runs daily at **09:00 UTC** via the Laravel scheduler. It:

1. Queries workspaces with trials ending within 3 days
2. Queries workspaces with cancelled subscriptions ending within 7 days
3. Sends appropriate notifications to workspace owners
4. Logs each sent reminder to prevent duplicates

### Deduplication

Each reminder is logged in the `billing_reminder_logs` table with a unique constraint on `(workspace_id, user_id, reminder_type)`. This ensures:

- Each workspace owner receives only **one** trial ending reminder per workspace
- Each workspace owner receives only **one** subscription expiration reminder per workspace

### Notification Channels

Both notification types respect user notification preferences:

- **Category**: `billing` — users can opt out of billing notifications
- **Channels**: Email (`mail`) and in-app (`database`) — users can choose which channels to receive notifications on

### Notification Analytics

Both notifications are automatically tracked by the Notification Delivery Analytics system under the `billing` category.

## Artisan Command

```bash
# Run reminders
php artisan app:send-billing-reminders

# Dry run — show what would be sent without sending
php artisan app:send-billing-reminders --dry-run
```

## Database Schema

### `billing_reminder_logs`

| Column         | Type      | Description                            |
|---------------|-----------|----------------------------------------|
| id            | bigint    | Primary key                            |
| workspace_id  | bigint    | FK to workspaces                       |
| user_id       | bigint    | FK to users (owner who was notified)   |
| reminder_type | string    | `trial_ending` or `renewal_upcoming`   |
| created_at    | timestamp | When the reminder was sent             |
| updated_at    | timestamp | Last update                            |

**Unique constraint**: `(workspace_id, user_id, reminder_type)`

## Configuration

- **Trial reminder window**: 3 days (constant in `SendBillingReminders` command)
- **Renewal reminder window**: 7 days (constant in `SendBillingReminders` command)
- **Trial duration**: Configured in `config/billing.php` → `trial_days` (default: 14)
- **Schedule**: Daily at 09:00 UTC (configured in `routes/console.php`)

## Testing

19 tests cover:

- Trial ending reminders (sent, skipped when > 3 days, skipped when expired, deduplication, skipped when no trial)
- Subscription renewal reminders (sent, skipped when > 7 days, skipped when no ends_at, deduplication)
- Dry-run mode
- Notification mail content (subject lines, singular/plural day text, action URLs)
- Notification database payloads
- Channel preference respect (category opt-out, email channel opt-out)
- BillingReminderLog model relationships

```bash
php artisan test --compact tests/Feature/Billing/BillingRemindersTest.php
```
