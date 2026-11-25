# Laravel SaaS Starter

Production starter for a multi-tenant SaaS product: workspace teams, Stripe billing, an admin panel, and a React UI served by Inertia. Built by [XCO Agency](https://xco.agency).

[![Tests](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/tests.yml/badge.svg)](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/tests.yml)
[![Lint](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/lint.yml/badge.svg)](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/lint.yml)
[![CodeQL](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/codeql.yml/badge.svg)](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/codeql.yml)
[![Dependency Audit](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/dependency-audit.yml/badge.svg)](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/dependency-audit.yml)

## What you get

- **Authentication (Fortify).** Registration, login, email verification, password reset, and confirmed TOTP two-factor authentication. Views are Inertia pages registered in `app/Providers/FortifyServiceProvider.php`. GitHub and Google login go through Socialite (`app/Http/Controllers/Auth/SocialiteController.php`).
- **Workspaces.** Users belong to one or more workspaces. Roles on the pivot are owner, admin, and member, with optional extra permissions. Middleware in `bootstrap/app.php` scopes access (`workspace`, `workspace.admin`, `workspace.owner`).
- **Billing (Cashier).** `Workspace` is the Cashier billable model (`Cashier::useCustomerModel(Workspace::class)`). Plans are `free`, `pro`, and `business` in `config/billing.php`. Checkout, the customer portal, and invoices live under `/billing`. Stripe posts to `POST /stripe/webhook` (`App\Http\Controllers\StripeWebhookController`, CSRF excluded for `stripe/*`).
- **Laravel AI.** `laravel/ai` is installed. Providers are configured in `config/ai.php` (default text provider `openai`). The package migration `create_agent_conversations_table` is present. There is no application agent class under `app/`.
- **Laravel MCP.** `laravel/mcp` is installed. `routes/ai.php` contains a commented `Mcp::web()` registration and there is no `app/Mcp` server. Nothing is exposed until you register one.
- **Octane.** The Docker image runs FrankenPHP through `php artisan octane:frankenphp` (`OCTANE_SERVER` defaults to `frankenphp` in `config/octane.php`). Local `composer run dev` uses `php artisan serve`, not Octane.
- **Inertia.** Server routes return `Inertia::render()`. The client is React 19 with Inertia React 3, Tailwind CSS 4, and Wayfinder-generated route helpers.
- **Also included.** Pennant feature flags, Sanctum personal access tokens, workspace API keys, Scout search on `Workspace` (default driver `collection`), Reverb broadcasting, Spatie activity log, webhook delivery, database mail templates, Sentry, and a super-admin area.

Feature notes are indexed in [docs/README.md](docs/README.md).

## Stack

Versions below are the ones locked in `composer.lock` and `pnpm-lock.yaml` on this branch. Constraints live in `composer.json` and `package.json`.

| Piece | Locked version |
| --- | --- |
| PHP | `^8.4` (CI uses 8.4) |
| laravel/framework | 13.40.0 |
| inertiajs/inertia-laravel | 3.1.1 |
| @inertiajs/react | 3.7.0 |
| react / react-dom | 19.2.7 |
| tailwindcss | 4.3.2 |
| vite | 8.1.3 |
| typescript | 6.0.3 |
| laravel/fortify | 1.37.2 |
| laravel/cashier | 16.9.0 |
| laravel/ai | 0.8.1 |
| laravel/mcp | 0.8.2 |
| laravel/octane | 2.22.0 |
| laravel/pennant | 1.26.0 |
| laravel/reverb | 1.10.2 |
| laravel/sanctum | 4.3.2 |
| laravel/scout | 11.9.0 |
| laravel/socialite | 5.28.0 |
| laravel/wayfinder | 0.1.20 |
| sentry/sentry-laravel | 4.26.0 |
| spatie/laravel-activitylog | 5.1.3 |
| spatie/laravel-database-mail-templates | 3.7.2 |
| spatie/laravel-webhook-server | 4.0.0 |
| pestphp/pest | 4.7.4 |
| phpunit/phpunit | 12.5.30 |
| eslint | 9.39.4 |
| prettier | 3.9.4 |
| pnpm | 10.33.0 (`packageManager`) |

Node in GitHub Actions is 22. The Dockerfile installs Node from NodeSource’s current LTS setup script and does not pin a version.

## Start a new product

1. Clone this repository (or create a new repo from it) and pick your own remote. The Composer package name is `xco-agency/laravel-saas-starter`.
2. Set `APP_NAME` and `APP_URL`. Replace public copy, the landing page, and mail “from” identity with the product’s own.
3. Put Stripe price ids in the billing env vars (see [docs/environment.md](docs/environment.md)) or edit the plan catalog in `config/billing.php`.
4. Add OAuth client ids only if you ship GitHub or Google login.
5. Add an AI provider key only if you build on `laravel/ai`. Register an MCP server in `routes/ai.php` only if you want one.
6. Do not run `DatabaseSeeder` on a production database. It fills the app with demo users, workspaces, and related rows.

Local commands, queues, Docker, and Coolify are in `docs/`.

## Local setup

Requirements: PHP 8.4, Composer 2, Node.js 22, pnpm 10.33, and a database. SQLite is the default. MySQL and PostgreSQL work if you set `DB_CONNECTION` and the matching host settings. Billing needs a Stripe account. Realtime needs Reverb’s app id, key, and secret.

```bash
git clone https://github.com/xco-agency/laravel-saas-starter.git
cd laravel-saas-starter
composer install
pnpm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
pnpm run build
composer run dev
```

`composer run dev` starts the HTTP server, a queue listener, Pail, Vite, and Reverb together. The app is served at the host and port in `APP_URL` (the example file uses localhost). `composer run setup` is similar but calls `npm install` and `npm run build` instead of pnpm.

Optional demo data: `php artisan db:seed`. The seeder creates `admin@example.com`, `demo@example.com`, and a super-admin at `superadmin@example.com`. The password is the one written in `database/seeders/DatabaseSeeder.php`.

Every variable is listed, by name only, in [docs/environment.md](docs/environment.md). Further detail: [docs/getting-started.md](docs/getting-started.md).

## Operate it

| Topic | Guide |
| --- | --- |
| Queues and the scheduler | [docs/queues-and-scheduler.md](docs/queues-and-scheduler.md) |
| Docker image | [docs/docker.md](docs/docker.md) |
| Coolify | [docs/deploy-coolify.md](docs/deploy-coolify.md) |
| Tests | [docs/testing.md](docs/testing.md) |

## Tests and CI

```bash
php artisan test --compact
php artisan test --compact tests/Feature/Auth/AuthenticationTest.php
```

Pest feature tests use an in-memory SQLite database (`phpunit.xml`). The suite is about 1,470 cases under `tests/Feature` and `tests/Unit`. There is no `tests/Browser` directory.

Workflows in `.github/workflows/` (`tests.yml`, `lint.yml`, `dependency-audit.yml`, `codeql.yml`, `release.yml`, `stale.yml`) run only on `workflow_dispatch`. Tests and lint use PHP 8.4, pnpm, and Node 22. CodeQL’s matrix language is `javascript-typescript` only.

## License

MIT. See [LICENSE](LICENSE). Questions: open a GitHub issue or email [support@xco.agency](mailto:support@xco.agency).
