<!-- Generated from ai-config/brain/rules/laravel-app.md — edit there and re-run ai-config/install.sh to re-sync. Do not edit here. -->

# XCO Laravel App — Shared Engineering Rules

> Synced into every XCO Laravel app at `.claude/rules/00-xco-laravel.md` by `ai-config/install.sh`.
> These are the conventions shared by **all** XCO Laravel backends (Sappo, Shopeye, Claium, Mindeq, …).
> App-specific architecture lives in that app's own rule file (e.g. `10-xco-sappo.md`) and its `CLAUDE.md`.
> **Source of truth for versions is always `composer.json` / `composer.lock`** — never this file, never `CLAUDE.md`, never memory. Apps deliberately differ.

## Docs & API currency — MCP first (non-negotiable)

**Never answer a Laravel, package, or Shopify question from memory.** Framework majors ship yearly, packages move weekly, and the Shopify API ships a new version every quarter (Jan / Apr / Jul / Oct), deprecating fields with each one. Training data goes stale between releases; the MCP servers do not. Every platform fact — a helper signature, a config key, an Eloquent API, an artisan flag, a Shopify field or webhook topic — comes from an MCP tool, or it does not get written.

The `xco-laravel` plugin ships the servers. The host prefixes tool names (e.g. `mcp__plugin_xco-laravel_laravel-boost__search-docs`).

### Laravel Boost (`laravel-boost`) — the framework side

Boost reads **this application**: the installed versions, the real schema, the live config. That is why it beats both memory and a generic web search.

| Tool | Use for |
| --- | --- |
| `application-info` | **Call first in any Laravel session.** The PHP / Laravel / package versions actually installed. Every version claim starts here. |
| `search-docs` | Version-aware docs for Laravel **and** the installed first-party packages (Horizon, Octane, Inertia, Pint, Pail, Nightwatch…), scoped to the versions this app runs. |
| `database-schema` / `database-connections` | Real tables, columns, indexes, connections. Never infer a column from a model. |
| `database-query` | Read-only checks against a connection. |
| `tinker` | Execute inside the booted app to confirm behaviour instead of guessing it. |
| `last-error` / `read-log-entries` / `browser-logs` | Diagnose from the actual entry, not a hypothesis. |
| `get-absolute-url` | Build a correct URL for the local environment. |

Boost also ships **upgrade prompts** (Laravel major, Inertia, Livewire) and a code-simplifier prompt — use them for upgrades rather than hand-rolling a plan. If Boost is not installed in an app, that is itself a gap worth reporting (`composer require laravel/boost --dev`).

**Mandatory before writing or changing**: any unfamiliar framework/package API, a migration or schema-dependent query, a config key, a queue/scheduler setting, or an upgrade. Loop: `application-info` → `search-docs` (+ `database-schema` when data-shaped) → write code → `php artisan test` + `./vendor/bin/pint --dirty`.

### Shopify Dev MCP (`shopify-dev-mcp`) — for the Shopify-facing apps

Most XCO Laravel backends are Shopify clients. Where that is true, the same rule the Remix apps follow applies here — see `brain/rules/shopify-app.md` for the full loop:

- `learn_shopify_api` first, with the app's pinned `version` (returns the `conversationId` every other tool needs).
- `search_docs_chunks` with `api_name: "admin"` and `version` set to the version this app pins, not the newest, before using any field; also for webhook topics, scopes, and bulk-operation semantics.
- `validate` (`api: "admin"`, pinned `version`) on every query/mutation you write or edit — including strings assembled by a query-builder service: build one and validate the *output*, not the template. (`validate_graphql_codeblocks` no longer exists.)

The REST Admin API has been legacy since 2024-10. New integrations go GraphQL; don't add REST calls where a GraphQL equivalent exists.

### Version currency

- Pin the Shopify API version in **one place** (a config key such as `config/shopify.php` `api_version`, read by the API services) — never at a call site.
- Shopify supports each stable version ~12 months, then silently falls forward to the oldest supported one, changing payload shapes under you. More than two releases behind is a finding. Run `xco-sappo-api-currency` for the full audit.
- A version bump — Shopify or a framework/package major — is its own change with its own test pass. Never a drive-by inside a feature diff.
- Where a Laravel backend and a Remix app consume the same webhook payloads, their pins must move together; a one-sided bump breaks the other side.

If an MCP server is unreachable, **say so out loud** and fall back to `laravel.com/docs` / `shopify.dev` over WebFetch. Never fall back to memory.

## Structure & conventions

- Standard Laravel layout. Where an app is modular (`app/Modules/{Module}/`), module-specific logic lives in its module — never in shared `app/`. Shared code is only what genuinely serves more than one module.
- Constructor property promotion, explicit return types, typed properties. Curly braces always, even for one-liners.
- Validation goes in a **Form Request**, not inline in the controller.
- Casts are declared in the `casts()` method, not the legacy `$casts` property.
- Business logic lives in Actions/Services, not controllers; controllers stay thin.
- Bounded sets are **enums**, not loose strings (`xco-create-bounded-enum`).
- Inertia + React frontends: follow the app. Where it already depends on `@xco-agency/corex-ui` (the Shopify-facing apps, e.g. Claium, Shopeye), new UI uses it and follows the `xco-corex-ui` skill; never hand-roll admin widgets next to it. Typecheck with the app's own script (`pnpm typecheck`) when you touch the frontend.

## Configuration & environment

- `env()` is only ever called from files in `config/`. Everywhere else reads `config()` — anything else breaks under config caching.
- No secrets in code, in committed `.env` files, or in log output. Required config is validated at boot, not discovered at runtime.
- New config keys ship with a sensible default and a line in `.env.example`.

## Database

- Eloquent over raw `DB::`; parameter binding always (never string-interpolate into SQL).
- Eager-load relations that a loop touches — N+1 in a queue worker is a production incident, not a style nit.
- Every schema change is a migration, reversible where it can be. Never hand-edit a shipped migration; add a new one.
- New models ship with a factory. Seeders for reference data.
- Multi-tenant / multi-database apps: **scope every query to the tenant** and switch connection context before the first query. Returning another tenant's data is a CRITICAL bug, not a regression.

## Queues & scheduling

- Anything slow, external, or retryable is a **queued job** (`xco-create-queued-job`), not inline request work.
- Jobs must be **idempotent** — they will be retried. Design for at-least-once delivery.
- Set explicit `$tries` / `$backoff` / `$timeout`; a job with unbounded retries against a failing API is an outage amplifier.
- Queue names are deliberate — memory-heavy work does not share a queue with latency-sensitive work.
- Scheduled commands live in the app's schedule definition and are safe to run twice.

## Errors & logging

- Log with context (`['shop' => …, 'id' => …]`), through the app's own logging helper where one exists, so entries are filterable per module/app.
- Never swallow an exception silently. Catch narrowly, log with the exception, and either recover or rethrow.
- User-facing messages never leak internals (SQL, stack traces, tokens, upstream error bodies).

## Security

- Every route is authenticated/authorized unless it is deliberately public — say so explicitly when adding a public route.
- Webhook and callback endpoints **verify their signature (HMAC)** before doing anything with the payload.
- Rate-limit public and webhook endpoints.
- Treat all external payloads as untrusted input: validate shape before use.
- Mass assignment is guarded (`$fillable`), and request data is never passed wholesale into a model without validation.

## Testing

- **Pest** is the standard (the major differs per app; read `composer.json`). New features and bug fixes need a test; a bug fix starts with the failing test.
- Test behaviour through the app (HTTP, job dispatch, events), not implementation details.
- Fake what you don't own: `Http::fake()`, `Queue::fake()`, `Event::fake()`, `Bus::fake()`. Never hit a live Shopify or third-party API from a test.
- `php artisan test` and `./vendor/bin/pint --dirty` both pass before work is declared done (a PostToolUse hook also runs Pint).

## Key commands

```bash
php artisan test                      # Pest (filter with --filter=Name)
./vendor/bin/pint --dirty             # format changed files
php artisan about                     # environment sanity check
composer outdated --direct            # dependency currency
```
