# Laravel SAAS Starter

> A production-ready Laravel SaaS starter kit with authentication, billing, teams, and everything you need to launch faster.

**Built by [XCO Agency](https://xco.agency)**

[![DigitalOcean Referral Badge](https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%201.svg)](https://www.digitalocean.com/?refcode=9d9a85ad18a3&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge)
[![Tests](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/tests.yml/badge.svg)](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/tests.yml)
[![Lint](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/lint.yml/badge.svg)](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/lint.yml)
[![CodeQL](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/codeql.yml/badge.svg)](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/codeql.yml)
[![Dependency Audit](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/dependency-audit.yml/badge.svg)](https://github.com/XCO-Agency/Laravel-SAAS-Starter/actions/workflows/dependency-audit.yml)

## 🚀 Features

- **🔐 Authentication & Security** - Complete system with standard login, 2FA, password resets, profile management, and verified domains.
- **🏢 Multi-tenant Workspaces** - Seamless workspace management allowing users to operate within parallel organizational structures.
- **👥 Team Management** - Robust invitation system with granular workspace-level roles (Owner, Admin, Member).
- **💳 Stripe Billing** - Integrated Laravel Cashier handles subscription provisioning, secure customer portals, and dynamic pricing tiers per workspace.
- **👑 Advanced Admin Panel** - Global super-admin dashboard for user impersonation, cross-workspace monitoring, and central operations.
- **🎉 Announcements System** - Global notification broadcasts with colored typings, dynamic scheduling, and dismissible states.
- **🚩 Feature Flags (Pennant)** - Database-driven feature flagging with targeted, workspace-specific rollout mechanisms.
- **📜 System Audit Logs** - Complete change history and system-wide visibility via Spatie Activitylog tracking.
- **🌙 Elegant UI Components** - Beautiful React 19 light/dark themes powered by Shadcn/UI and smooth Tailwind CSS v4 styling.
- **⚡ Modern Architecture** - Laravel 12 + Inertia.js v2, strictly typed via Pest tests (1,000+ tests out-of-the-box).

## 📋 Requirements

- PHP 8.2 or higher
- Composer
- Node.js 22+ and npm/pnpm
- SQLite, MySQL, or PostgreSQL
- Stripe account (for billing features)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/xco-agency/laravel-saas-starter.git
   cd laravel-saas-starter
   ```

2. **Install PHP dependencies**

   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

4. **Set up environment**

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure your `.env` file**

   ```env
   APP_NAME="Laravel SAAS Starter"
   APP_URL=http://localhost:8000
   
   DB_CONNECTION=sqlite
   # or use MySQL/PostgreSQL
   # DB_CONNECTION=mysql
   # DB_HOST=127.0.0.1
   # DB_PORT=3306
   # DB_DATABASE=your_database
   # DB_USERNAME=your_username
   # DB_PASSWORD=your_password
   
   # Stripe Configuration (required for billing)
   STRIPE_KEY=your_stripe_key
   STRIPE_SECRET=your_stripe_secret
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

6. **Run migrations**

   ```bash
   php artisan migrate
   ```

7. **Build frontend assets**

   ```bash
   npm run build
   # or
   pnpm build
   ```

8. **Start the development server**

   ```bash
   composer run dev
   # or separately:
   php artisan serve
   npm run dev
   ```

## 🎯 Quick Start

After installation, you can:

1. Visit `http://localhost:8000` to see the landing page
2. Register a new account
3. Create your first workspace
4. Invite team members
5. Set up billing with Stripe

## 🧪 Testing

Run the test suite using Pest:

```bash
php artisan test
```

Run specific test files:

```bash
php artisan test tests/Feature/Auth/LoginTest.php
```

## 📚 Tech Stack

- **Backend**: Laravel 12
- **Frontend**: React 19 with Inertia.js v2
- **Styling**: Tailwind CSS v4
- **Authentication**: Laravel Fortify
- **Billing**: Laravel Cashier (Stripe)
- **Testing**: Pest PHP v4
- **Activity Tracking**: Spatie Activitylog
- **Feature Flags**: Laravel Pennant
- **Code Quality**: Laravel Pint, Prettier, ESLint

## 📚 Deep Documentation

For a comprehensive review of the project's internal architecture, component strategies, and feature usage instructions, **explore the dedicated [`/docs`](./docs/README.md) folder:**

**Core**
[Authentication](./docs/features/authentication.md) | [Workspaces](./docs/features/workspaces.md) | [Team Management](./docs/features/team-management.md) | [Session Management](./docs/features/session-management.md)

**Billing & Usage**
[Billing](./docs/features/billing.md) | [Seat-Based Billing](./docs/features/seat-billing.md) | [Usage Dashboard](./docs/features/usage-dashboard.md)

**Admin**
[Admin Panel](./docs/features/admin-panel.md) | [Impersonation](./docs/features/impersonation.md) | [System Health](./docs/features/system-health.md) | [Scheduled Tasks](./docs/features/scheduled-tasks.md) | [Data Retention](./docs/features/data-retention.md) | [SEO Management](./docs/features/seo-management.md)

**Platform Features**
[Announcements](./docs/features/announcements.md) | [Feature Flags](./docs/features/feature-flags.md) | [Audit Logs](./docs/features/audit-logs.md) | [Changelog](./docs/features/changelog.md) | [Email Templates](./docs/features/email-templates.md) | [Webhooks](./docs/features/webhooks.md) | [Real-time Notifications](./docs/features/real-time-notifications.md) | [Feedback](./docs/features/feedback.md) | [Onboarding Checklist](./docs/features/onboarding-checklist.md) | [Advanced Search](./docs/features/advanced-search.md)

**Security & Compliance**
[2FA Enforcement](./docs/features/2fa-enforcement.md) | [GDPR Data Export](./docs/features/gdpr-data-export.md) | [Account Deletion](./docs/features/account-deletion.md) | [Security](./docs/features/security.md)

**API & Integrations**
[Workspace API Keys](./docs/features/workspace-api-keys.md) | [API Authentication](./docs/features/api-authentication.md) | [API Documentation](./docs/features/api-documentation.md) | [API Usage Dashboard](./docs/features/api-usage-dashboard.md)

**Frontend**
[Internationalization](./docs/features/internationalization.md) | [UI & Theming](./docs/features/ui-and-theming.md)

## 🏗️ Project Structure

```text
├── app/
│   ├── Http/Controllers/  # Standard and Admin-specific controllers
│   ├── Models/            # Global Eloquent structures
│   └── Providers/         # Extensible application services (Pennant configs etc)
├── database/              # Robust migrations, factories and hydration seeders
├── docs/                  # In-depth architectural feature documentation!
├── resources/
│   ├── js/
│   │   ├── components/    # Reusable shadcn/ui & generic ui components
│   │   ├── layouts/       # Strict domain boundaries (admin vs customer ui)
│   │   └── pages/         # Inertia frontend pages
└── tests/                 # Standardized Pest tests (1,000+ available)
```

## 🔧 Configuration

### Workspace Management

Workspaces are multi-tenant organizations. Users can:

- Create multiple workspaces
- Switch between workspaces
- Invite team members to workspaces
- Assign roles (owner, admin, member)

### Billing

Configure Stripe in your `.env` file. The application supports:

- Subscription management
- Multiple pricing tiers
- Billing portal access
- Webhook handling

#### Stripe Webhooks

**Endpoint:** `/stripe/webhook`

**Required Events:**

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `invoice.payment_action_required`

### Internationalization

Add new languages by:

1. Creating translation files in `resources/js/locales/`
2. Adding the locale to your configuration
3. Updating the language selector component

## 🔄 CI/CD & Security

### GitHub Actions Workflows

- `tests.yml`: runs Pest test suite on PHP 8.2, 8.3, and 8.4
- `lint.yml`: runs Laravel Pint, Prettier check, and ESLint
- `dependency-audit.yml`: runs `composer audit` and `npm audit --audit-level=high`
- `codeql.yml`: performs CodeQL static analysis for PHP and JavaScript/TypeScript
- `release.yml`: runs release-please for automated releases
- `stale.yml`: marks and closes inactive issues/PRs

### Running Workflows Locally with act

1. Install `act` and Docker.
2. Create `.actrc` for Apple Silicon compatibility:

```text
-P ubuntu-latest=catthehacker/ubuntu:act-latest
--container-architecture linux/amd64
--env PATH=/opt/acttoolcache/node/24.14.0/x64/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

3. Run workflows:

```bash
act push -j quality -W .github/workflows/lint.yml
act push -j audit -W .github/workflows/dependency-audit.yml
act push -j ci -W .github/workflows/tests.yml --matrix php-version:8.4
```

### Notes for Local act Runs

- `release.yml` and `stale.yml` require `GITHUB_TOKEN`.
- `codeql.yml` should be validated on GitHub-hosted runners because it needs `security-events: write` permissions.
- `dependency-audit.yml` currently fails because of npm advisories in the lockfile.
- `tests.yml` may produce `419` CSRF responses under `act` despite passing on GitHub-hosted runners.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

This project is open-sourced software licensed under the [MIT license](LICENSE).

## 🙏 Credits

Built with ❤️ by [XCO Agency](https://xco.agency)

## 📞 Support

For support, please open an issue on GitHub or contact us at [support@xco.agency](mailto:support@xco.agency)

---

**Ready to build your SaaS?** Get started today and launch 10x faster! 🚀
