# Project Documentation

Welcome to the documentation for the Laravel SaaS Starter kit.

This repository contains comprehensive documentation for the architecture, features, and core functionality of the platform.

## Features Index

- [Authentication & Access Control](./features/authentication.md)
- [Workspaces & Multi-tenancy](./features/workspaces.md)
- [Team Management & Roles](./features/team-management.md)
- [Billing & Subscriptions](./features/billing.md)
- [Seat-Based Billing](./features/seat-billing.md)
- [Admin Panel](./features/admin-panel.md)
- [Audit Logs](./features/audit-logs.md)
- [Announcements](./features/announcements.md)
- [Feature Flags](./features/feature-flags.md)
- [Webhooks & Delivery Logs](features/webhooks.md)
- [Email Templates](./features/email-templates.md)
- [User Feedback Widget](./features/feedback.md)
- [Data Retention Policies](./features/data-retention.md)
- [2FA Enforcement per Workspace](./features/2fa-enforcement.md)
- [System Health Monitor](./features/system-health.md)
- [Public Changelog](./features/changelog.md)
- [Workspace API Keys](./features/workspace-api-keys.md)
- [Scheduled Tasks Monitor](./features/scheduled-tasks.md)
- [Internationalization (i18n)](./features/internationalization.md)
- [UI & Theming](./features/ui-and-theming.md)
- [Architecture & Security](./features/security.md)

## Development Directives

> **Important Rule:** Whenever a new feature is built or an existing feature undergoes major architectural changes, its corresponding documentation file in `docs/features/` must be created or updated.

### Tech Stack

- Frontend: React 19, Inertia v2, Tailwind CSS v4, shadcn/ui
- Backend: Laravel 12, standard PHP 8.4 typing
- Database: SQLite (default), MySQL, PostgreSQL compatible
- Testing: Pest (Feature & Browser Testing)
