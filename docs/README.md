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
- [Webhooks & Delivery Logs](./features/webhooks.md)
- [Email Templates](./features/email-templates.md)
- [User Feedback Widget](./features/feedback.md)
- [Data Retention Policies](./features/data-retention.md)
- [2FA Enforcement per Workspace](./features/2fa-enforcement.md)
- [System Health Monitor](./features/system-health.md)
- [Public Changelog](./features/changelog.md)
- [Workspace API Keys](./features/workspace-api-keys.md)
- [API Documentation](./features/api-documentation.md)
- [Real-time Notifications](./features/real-time-notifications.md)
- [Notification Channel Preferences](./features/notification-channel-preferences.md)
- [Notification Delivery Analytics](./features/notification-delivery-analytics.md)
- [GDPR Data Export](./features/gdpr-data-export.md)
- [Advanced Global Search](./features/advanced-search.md)
- [Scheduled Tasks Monitor](./features/scheduled-tasks.md)
- [Account Deletion](./features/account-deletion.md)
- [Usage Dashboard](./features/usage-dashboard.md)
- [Admin Impersonation](./features/impersonation.md)
- [SEO Management](./features/seo-management.md)
- [Onboarding Checklist](./features/onboarding-checklist.md)
- [Onboarding Wizard](./features/onboarding-wizard.md)
- [API Authentication](./features/api-authentication.md)
- [Session Management](./features/session-management.md)
- [Internationalization (i18n)](./features/internationalization.md)
- [UI & Theming](./features/ui-and-theming.md)
- [Architecture & Security](./features/security.md)
- [Shareable Invite Links](./features/invite-links.md)
- [Login Activity Log](./features/login-activity.md)
- [Admin Maintenance Mode](./features/maintenance-mode.md)
- [Workspace Custom Branding](./features/workspace-branding.md)
- [Workspace Trash & Restore](./features/workspace-trash.md)
- [Workspace Suspension](./features/workspace-suspension.md)
- [Password Change History](./features/password-change-history.md)
- [User Timezone & Date Format](./features/user-timezone-date-format.md)
- [Granular Roles & Permissions](./features/granular-roles-permissions.md)

## Development Directives

> **Important Rule:** Whenever a new feature is built or an existing feature undergoes major architectural changes, its corresponding documentation file in `docs/features/` must be created or updated.

### Tech Stack

- Frontend: React 19, Inertia v2, Tailwind CSS v4, shadcn/ui
- Backend: Laravel 12, standard PHP 8.4 typing
- Database: SQLite (default), MySQL, PostgreSQL compatible
- Testing: Pest (Feature & Browser Testing)
