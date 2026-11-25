# Deploy on Coolify

Coolify was read only, from the staging team token, while these notes were written. No deploy, restart, or env value was requested.

## What is configured today

| Fact | Observed |
| --- | --- |
| Where | Staging Coolify. A search on the production Coolify token for this application name returned no resource. |
| Application | `Laravel-SAAS-Starter` |
| Public URL | `https://laravel-saas-starter.xco.agency` |
| Source | `git@github.com:XCO-Agency/Laravel-SAAS-Starter.git`, branch `main` |
| Build pack | Dockerfile, file `/Dockerfile`, no stage target |
| Port | `8000` (`ports_exposes`). No port mapping beyond that. |
| Start command | Empty, so the image `ENTRYPOINT` runs |
| Health check | Disabled. The stored path is `/`, method GET, expected status 200, interval 5s. |
| Scheduled tasks | None |
| Status | `exited:unhealthy`. `last_online_at` is 2026-10-18. The container was not running when this was read. |

The three stored deployments (newest first, all `failed`, server `staging`, commit `HEAD`) are dated 2026-10-21, 2026-10-09, and 2026-10-03. The newest log summary stops before any image build: `git ls-remote` of `refs/heads/main` returned `Permission denied (publickey)`. A successful boot of this Dockerfile on that server was not observed.

Runtime env **names** on that application (production and preview copies of the same names) are:

`APP_ENV`, `APP_DEBUG`, `APP_KEY`, `APP_NAME`, `APP_TIMEZONE`, `APP_URL`, `DB_CONNECTION`, `DB_DATABASE`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `FILESYSTEM_DISK`, `JWT_SECRET`, `OCTANE_HTTPS`, `OCTANE_SERVER`, `QUEUE_CONNECTION`, `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID`, `STRIPE_BUSINESS_MONTHLY_PRICE_ID`, `STRIPE_BUSINESS_YEARLY_PRICE_ID`, `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`, `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`, `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`.

`VITE_REVERB_PORT` and `VITE_REVERB_SCHEME` are marked both runtime and build time. `APP_TIMEZONE` and `JWT_SECRET` are set there and are not read by this codebase. Values were not fetched.

## Deploy a fork

1. Create a Coolify application from your git remote. Build pack **Dockerfile**, Dockerfile location `/Dockerfile`, port **8000**. Leave the start command empty so `entrypoint.sh` runs.
2. Attach a database the container can reach on boot. The entrypoint runs `php artisan migrate --force` before Octane listens. SQLite inside the container is not a durable store: the file disappears when the container is replaced, and the Coolify app is set up with `DB_HOST` rather than a file.
3. Set the variable names in [environment.md](environment.md) that you actually use. At minimum for this image: `APP_NAME`, `APP_ENV` (`production`), `APP_KEY`, `APP_DEBUG` (off), `APP_URL` (the public https origin), `DB_*`, `QUEUE_CONNECTION`, `SESSION_DRIVER`, `CACHE_STORE`, and mail. Add Stripe keys and price ids to charge. Set `OCTANE_HTTPS` when Coolify’s proxy terminates TLS.
4. Mark every `VITE_*` variable as available at **build** time. `Dockerfile` runs `pnpm run build` inside the image build. A runtime-only value never reaches the browser bundle. `VITE_APP_NAME` is not in the Coolify key list above; the client falls back to a generic name when it is missing at build time.
5. Add a Coolify scheduled task on the application, every minute, command `php artisan schedule:run`. The image does not run the scheduler, and this application’s task list is empty. Commands and times are in [queues-and-scheduler.md](queues-and-scheduler.md).
6. Queue workers: the entrypoint’s worker listens on `high,low` only. Queued jobs in this repo use `default`. Either change the process you run (a code or entrypoint change, which this docs pass does not make) or add a separate worker process whose command is `php artisan queue:work` with no `--queue` filter. One worker is enough.
7. Reverb: the process binds port 8080 in the container, and Coolify exposes only 8000. Realtime from browsers needs 8080 published or proxied, and the baked `VITE_REVERB_*` host must be that public address. Until then, treat broadcasting as in-container only.
8. If you enable health checks, use path `/up` (registered in `bootstrap/app.php`). The stored check path `/` is the public Inertia page, and checks are currently off. A check that starts before `migrate` finishes will fail; the stored start period is 5 seconds, which is short for a first migration.
9. Deploy secrets belong to the Coolify Git integration. The latest failure was GitHub SSH `publickey` on `git ls-remote`, which is a source credential problem, not an application boot problem. Fix the key Coolify uses for `XCO-Agency/Laravel-SAAS-Starter` before expecting a new image.

After a deploy, confirm `GET /up` returns successfully and that `php artisan schedule:list` inside the container shows the five tasks. Those two checks were not run here, because the application was exited.
