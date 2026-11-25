# Queues and scheduler

The app timezone in `config/app.php` is `UTC`. Schedule times below are UTC. `routes/console.php` is where the schedule is registered. There is no `app/Console/Kernel.php`.

## Queues

`QUEUE_CONNECTION` defaults to `database`. Jobs are rows in the `jobs` table. Failed jobs use `QUEUE_FAILED_DRIVER` (`database-uuids`) and the failed-jobs table.

Two jobs implement `ShouldQueue` and do not call `onQueue()`:

- `App\Jobs\DispatchBroadcastMessage` sends a platform broadcast to users in chunks.
- `App\Jobs\ExportPersonalDataJob` builds a user’s personal-data archive.

They therefore land on the connection’s default queue name: `default`, unless you set `DB_QUEUE` (database driver) or `REDIS_QUEUE` (redis driver).

Notifications, mail, and Scout can also queue work when their drivers are configured to. Outgoing workspace webhooks use `spatie/laravel-webhook-server`, which queues deliveries on the same default connection.

### Local

`composer run dev` runs `php artisan queue:listen --tries=1` with no `--queue` filter, so it reserves the default queue.

### Container

`entrypoint.sh` backgrounds:

```bash
php artisan queue:work --daemon --queue=high,low
```

`--queue=high,low` reserves only queues named `high` and `low`. It does not reserve `default`. With the jobs as they are written, that worker does not run `DispatchBroadcastMessage`, `ExportPersonalDataJob`, or other unscoped queued work.

Nothing in `app/` names a `high` or `low` queue. To process real jobs you need a worker whose queue list includes `default` (omit `--queue`, or pass a list that includes `default`). `queue:work` already stays running; the `--daemon` flag is legacy. This repo’s entrypoint was not executed as part of writing these docs, so the process exit status of that flag was not observed.

Run one worker per container replica, or move the worker to its own process, so replicas do not each run a competing copy unless you want that.

## Scheduler

`entrypoint.sh` does not start `schedule:work` or cron. The Coolify application for this repo has no scheduled tasks (see [deploy-coolify.md](deploy-coolify.md)). Until something calls `php artisan schedule:run` every minute, none of the tasks below run.

Registered in `routes/console.php`, each with `withoutOverlapping()`:

| Command | When |
| --- | --- |
| `app:prune-old-records` | Daily at 03:00 |
| `app:send-api-key-expiry-alerts` | Daily at 08:00 |
| `app:send-weekly-digests` | Monday at 08:00 |
| `app:send-billing-reminders` | Daily at 09:00 |
| `app:send-plan-usage-alerts` | Daily at 10:00 |

What they do:

- `app:prune-old-records` deletes old read notifications, activity, webhook logs, and archived feedback using the day counts in `config/retention.php`. `--dry-run` reports only.
- `app:send-api-key-expiry-alerts` notifies owners of workspace API keys that expire within 7 days.
- `app:send-weekly-digests` emails each workspace member a weekly activity digest. `app:preview-weekly-digest {workspace}` prints one digest and does not send it.
- `app:send-billing-reminders` sends trial-ending and renewal reminders.
- `app:send-plan-usage-alerts` emails owners at or above 80% of a plan limit.

Also on disk, not on the schedule:

- `workspaces:prune-trashed` permanently deletes soft-deleted workspaces after `--days` (default 30).
- `stripe:create-plans` creates Stripe products from `config/billing.php`.
- `app:version` prints the application name and `APP_VERSION`.

The admin page at `/admin/scheduled-tasks` lists whatever the scheduler has registered. It does not execute the tasks. See [features/scheduled-tasks.md](features/scheduled-tasks.md).

On one host, a crontab entry that runs `php artisan schedule:run` every minute is enough. Inside this image, add that as a platform scheduled task or a second process. Do not start a second scheduler loop on every replica without `withoutOverlapping()`’s cache lock being on a shared store (`CACHE_STORE` is `database` in the example file, which is shared if every replica uses the same database).
