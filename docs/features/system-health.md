# System Health Monitor

## Overview

The System Health Monitor provides super administrators with a real-time overview of infrastructure status, queue health, storage usage, and failed job management — all from a single admin panel page.

## Access

- **URL:** `/admin/system-health`
- **Middleware:** `auth`, `superadmin`
- **Nav:** Admin Panel sidebar → "System Health"

## Features

### Stats Dashboard

Four metric cards displaying:

| Metric | Description |
|--------|------------|
| Pending Jobs | Number of jobs currently waiting in the queue |
| Failed Jobs | Jobs that have thrown an exception and need attention |
| Database Size | SQLite database file size (human-readable) |
| PHP Version | Current PHP version with Laravel version subtitle |

### Infrastructure Drivers

Displays the configured drivers for:

- **Cache** — e.g. `database`, `redis`, `file`
- **Queue** — e.g. `database`, `redis`, `sync`
- **Session** — e.g. `database`, `cookie`, `file`

### Storage Usage

Shows disk usage for three `storage/` subdirectories:

- `storage/app` — Application files and uploads
- `storage/logs` — Laravel log files
- `storage/framework` — Cache, sessions, views

### Failed Job Management

A table listing up to 50 recent failed jobs with:

- **Job name** — Class basename of the failed job
- **Queue** — Which queue the job was on
- **Error** — Truncated exception message
- **Failed at** — Timestamp

#### Actions

| Action | Description |
|--------|------------|
| **Retry** | Re-queues the specific failed job |
| **Delete** | Removes the failed job record |
| **Flush All** | Deletes all failed jobs (with confirmation) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/system-health` | System health dashboard page |
| `POST` | `/admin/system-health/jobs/{id}/retry` | Retry a specific failed job |
| `DELETE` | `/admin/system-health/jobs/{id}` | Delete a specific failed job |
| `POST` | `/admin/system-health/jobs/flush` | Flush all failed jobs |

## Testing

7 Pest feature tests cover:

- Superadmin access control
- Regular user access denial
- Stat keys presence
- Failed job listing
- Failed job deletion
- Flush all failed jobs
- 404 for non-existent job deletion

Run tests:

```bash
php artisan test tests/Feature/Admin/SystemHealthTest.php
```
