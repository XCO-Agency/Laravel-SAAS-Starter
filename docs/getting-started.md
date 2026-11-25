# Getting started

This kit is an application you copy, not a library you require. A new product is a new git remote plus your own name, Stripe prices, and mail identity.

## Requirements

- PHP 8.4 and Composer 2. `composer.json` requires `php: ^8.4`.
- Node.js 22 and pnpm 10.33.0. CI installs Node 22 and runs `pnpm install --frozen-lockfile`. `package.json` sets `"packageManager": "pnpm@10.33.0"`.
- A database. `DB_CONNECTION` defaults to `sqlite`. MySQL, MariaDB, PostgreSQL, and SQL Server connection arrays exist in `config/database.php`.
- Stripe, if you charge. Without `STRIPE_KEY` and `STRIPE_SECRET`, paid checkout cannot call Stripe. The free plan does not need a Stripe price id.
- Reverb credentials if you keep `BROADCAST_CONNECTION` on `reverb` (the example file does).

## First boot

```bash
composer install
pnpm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
pnpm run build
composer run dev
```

`touch` matters for SQLite: the default database path is `database/database.sqlite`. Create that file before `migrate` when it is missing.

`composer run dev` (`composer.json` script `dev`) runs, via `concurrently`:

- `php artisan serve`
- `php artisan queue:listen --tries=1`
- `php artisan pail --timeout=0`
- `pnpm`’s `npm run dev` (Vite)
- `php artisan reverb:start`

`composer run dev:ssr` builds the SSR bundle and runs `php artisan inertia:start-ssr` instead of Vite. `INERTIA_SSR_ENABLED` defaults to true in `config/inertia.php`; the SSR URL defaults to the local Inertia SSR port. You only need the SSR process when you serve through the SSR renderer.

`composer run setup` copies `.env.example` when `.env` is missing, generates the key, migrates, then runs `npm install` and `npm run build`. Prefer pnpm for day-to-day installs so you stay on `pnpm-lock.yaml`. The lockfile CI uses is pnpm, not npm.

After `composer run dev`, open the URL in `APP_URL`. Register a user, or seed demo data (next section).

## Demo data

```bash
php artisan db:seed
```

`DatabaseSeeder` creates three fixed users and a pile of workspaces, invitations, flags, and logs:

| Email | Role |
| --- | --- |
| `admin@example.com` | Regular user |
| `demo@example.com` | Regular user, owner of several demo workspaces |
| `superadmin@example.com` | `is_superadmin` set, can open `/admin` |

The password for all three is the value passed to `Hash::make()` in `database/seeders/DatabaseSeeder.php`. Do not run this seeder on a production database.

## Make it your product

1. Set `APP_NAME`, `APP_URL`, and `MAIL_FROM_ADDRESS` / `MAIL_FROM_NAME`. `config/app.php` hardcodes the timezone to `UTC`. `APP_TIMEZONE` is not read.
2. Rename user-facing copy. Public pages are Inertia components under `resources/js/pages`. Translations live in `resources/js/locales` and `lang/`.
3. Plans are the `free`, `pro`, and `business` entries in `config/billing.php`. Display prices in that file are not sent to Stripe by themselves. Paid checkout uses `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID`, `STRIPE_BUSINESS_MONTHLY_PRICE_ID`, and `STRIPE_BUSINESS_YEARLY_PRICE_ID`. `php artisan stripe:create-plans` creates Stripe products from that config (`--force` recreates them). Trial length is `trial_days` (14) in the same file.
4. Point Stripe at `POST /stripe/webhook`. `bootstrap/app.php` skips CSRF for `stripe/*`. The controller extends Cashier’s webhook controller and logs `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`. Follow Cashier 16’s webhook event list for the rest of the subscription sync.
5. Social login is optional. Routes are `auth/{provider}/redirect` and `auth/{provider}/callback` for `github` and `google`, using `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`.
6. AI calls need a provider key from `config/ai.php` (default `OPENAI_API_KEY`). No agent is registered in this tree.
7. An MCP server is not registered. Uncomment or replace the sample in `routes/ai.php` when you add `app/Mcp` classes. Do not run `mcp:start` as a web server; it waits on stdin for JSON-RPC.
8. Keep `APP_DEBUG` off and `APP_ENV` on `production` when you deploy. Generate `APP_KEY` once per environment and keep it stable. Rotating it invalidates encrypted cookies and other ciphertext. `APP_PREVIOUS_KEYS` accepts a comma-separated list of old keys during a rotation.

## What is not in the tree

The README used to link custom fields, workspace tags, and workspace templates. There is no `custom-fields.md`, `workspace-tags.md`, or `workspace-templates.md`, and `app/Models` has no models for them. `AI_ROADMAP.md` still describes those tasks as done. Treat the models and routes as the source of truth.
