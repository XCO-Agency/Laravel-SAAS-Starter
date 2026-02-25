# Data Retention Policies

Configurable automatic cleanup of old records across four data types, preventing database bloat over time.

## How It Works

A daily scheduled Artisan command (`app:prune-old-records`) runs at 03:00 UTC and deletes records older than the configured threshold. Thresholds are defined in `config/retention.php` and can be overridden per-environment via environment variables.

## Default Policies

| Data Type | Default Retention | Scope |
|-----------|------------------|-------|
| In-App Notifications | 90 days | Read notifications only |
| Activity Log | 180 days | All entries |
| Webhook Delivery Logs | 90 days | All entries |
| User Feedback | 180 days | Archived entries only |

## Configuration

**`config/retention.php`** defines each policy:

```php
'notifications' => [
    'enabled'   => true,
    'days'      => env('RETENTION_NOTIFICATIONS_DAYS', 90),
    'read_only' => true, // only prune read notifications
],
```

Override in `.env`:

```env
RETENTION_NOTIFICATIONS_DAYS=90
RETENTION_ACTIVITY_DAYS=180
RETENTION_WEBHOOK_LOGS_DAYS=90
RETENTION_FEEDBACK_DAYS=180
```

## Artisan Command

```bash
# Preview what would be deleted (no changes made)
php artisan app:prune-old-records --dry-run

# Run actual pruning
php artisan app:prune-old-records
```

Output example:

```
┌─────────────────────┬─────────────────────────┬─────────┬─────────┐
│ Model               │ Retention Period         │ Records │ Action  │
├─────────────────────┼─────────────────────────┼─────────┼─────────┤
│ Notifications       │ 90 days (read only)      │ 42      │ deleted │
│ Activity Log        │ 180 days                 │ 18      │ deleted │
│ Webhook Logs        │ 90 days                  │ 7       │ deleted │
│ Feedback            │ 180 days (archived only) │ 3       │ deleted │
└─────────────────────┴─────────────────────────┴─────────┴─────────┘
```

## Scheduler

Registered in `routes/console.php`:

```php
Schedule::command('app:prune-old-records')->dailyAt('03:00')->withoutOverlapping();
```

The Laravel scheduler must be running for automatic pruning:

```bash
# Typically configured as a cron job:
* * * * * cd /your-app && php artisan schedule:run >> /dev/null 2>&1
```

## Admin Panel

Superadmins can view retention policies and trigger pruning manually at `/admin/retention`.

- **Active Policies table** — shows each model, its TTL, enabled status, and scope notes
- **Dry Run button** — previews what would be deleted without making changes
- **Run Pruning Now** — executes the command immediately and shows output
- **Environment Variables reference** — shows the env var names for quick configuration

## Key Files

| File | Role |
|------|------|
| `config/retention.php` | TTL config per data type |
| `app/Console/Commands/PruneOldRecords.php` | Artisan command with `--dry-run` |
| `routes/console.php` | Daily schedule registration |
| `app/Http/Controllers/Admin/RetentionController.php` | Admin index + prune endpoint |
| `resources/js/pages/admin/retention.tsx` | Admin UI page |

## Tests

```bash
php artisan test --compact tests/Feature/Admin/RetentionTest.php
```

| Test | Coverage |
|------|----------|
| Superadmin views retention page | 200 + Inertia component |
| Regular user is blocked | 403 |
| Old read notifications pruned; recent ones kept | Selective deletion |
| Dry run leaves all records intact | No deletion |
| Old archived feedback pruned; active feedback survives | Status-scoped deletion |
| Admin prune API endpoint returns JSON summary | Response structure |

## Extending

To add a new policy, add an entry to `config/retention.php` and handle it in `PruneOldRecords::handle()`.
