# Admin Scheduled Tasks Monitor

## Overview

The Scheduled Tasks Monitor gives super administrators a read-only view of every task registered in the Laravel scheduler. It displays the command, cron expression, human-readable frequency, next due time, timezone, and runtime flags — all in one admin page.

## Access

- **URL:** `/admin/scheduled-tasks`
- **Middleware:** `auth`, `superadmin`
- **Nav:** Admin Panel sidebar → "Scheduled Tasks"

## Features

### Summary Cards

Three metric cards displaying:

| Metric | Description |
|--------|------------|
| Total Tasks | Number of scheduled events registered in the application |
| No Overlap | Tasks configured with `withoutOverlapping()` |
| Background | Tasks configured with `runInBackground()` |

### Task Table

Each row shows:

| Column | Description |
|--------|------------|
| **Command** | Artisan command name (with optional description) |
| **Schedule** | Human-readable frequency + raw cron expression |
| **Next Due** | Calculated next run time using the cron expression |
| **Timezone** | Timezone the task runs in |
| **Flags** | `No Overlap` and `Background` badges when applicable |

### Human-Readable Cron Parsing

Common cron expressions are translated automatically:

| Expression | Translation |
|-----------|-------------|
| `* * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes |
| `0 * * * *` | Hourly |
| `0 0 * * *` | Daily at midnight |
| `0 0 * * 0` | Weekly on Sunday |
| `0 0 1 * *` | Monthly |
| Custom | Parsed to "Daily at HH:MM" or "Weekly on Day at HH:MM" when possible |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/scheduled-tasks` | Scheduled tasks monitoring page |

## How It Works

The controller introspects Laravel's `Schedule` singleton at runtime, iterating over all registered events. Next-due dates are calculated using the `dragonmantank/cron-expression` library (included with Laravel).

## Testing

8 Pest feature tests cover:

- Superadmin access control
- Regular user access denial
- Guest redirect
- Task structure validation
- Known command presence (prune-old-records)
- Human-readable resolution
- Next-due calculation
- Flag detection (withoutOverlapping)

Run tests:

```bash
php artisan test tests/Feature/Admin/ScheduledTaskTest.php
```
