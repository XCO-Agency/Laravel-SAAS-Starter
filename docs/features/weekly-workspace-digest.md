# Weekly Workspace Activity Digest

Every Monday at 08:00 UTC, all workspace members receive a weekly email/in-app summary covering team membership changes, activity event counts, and the three most recent workspace events.

## How It Works

1. The `app:send-weekly-digests` Artisan command runs on a Monday schedule (08:00 UTC).
2. All workspaces with at least one member are processed.
3. For each workspace, the command computes:
   - **Member count** and **delta** (net change from 7 days ago via `workspace_user.created_at`).
   - **Activity count** (rows in `activity_log` for that workspace in the last 7 days).
   - **Recent events** (up to 3 most recent activity descriptions).
4. Each member of the workspace is notified via `WeeklyWorkspaceDigestNotification`.
5. The notification respects **category** (`team`) and **channel** (`email` / `in_app`) preferences.

## Scheduling

```php
// routes/console.php
Schedule::command('app:send-weekly-digests')->weeklyOn(1, '08:00')->withoutOverlapping();
```

## Key Files

| File | Role |
|------|------|
| `app/Notifications/WeeklyWorkspaceDigestNotification.php` | Notification (mail + database) |
| `app/Console/Commands/SendWeeklyDigests.php` | Artisan command |
| `routes/console.php` | Monday 08:00 UTC schedule |

## Notification Channels

The notification respects user preferences:
- **Category:** `team` — if disabled, no channels are returned and the notification is silently skipped.
- **Channel:** `email` → `mail`; `in_app` → `database`.

## Dry Run

```bash
php artisan app:send-weekly-digests --dry-run
```

Outputs a table of what would be sent without actually delivering any notifications.

## Testing

Test file: `tests/Feature/Notifications/WeeklyWorkspaceDigestTest.php`

- Command sends digest to all workspace members
- Dry-run mode sends nothing
- Command outputs notification count
- Notification skipped when `team` category is disabled
- Respects email channel preference
- Respects in-app channel preference
- Mail contains correct workspace summary data

Run: `php artisan test --compact tests/Feature/Notifications/WeeklyWorkspaceDigestTest.php`
