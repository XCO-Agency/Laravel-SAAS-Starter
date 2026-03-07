# Project Documentation

Welcome to the documentation for the Laravel SaaS Starter kit.

This repository contains comprehensive documentation for the architecture, features, and core functionality of the platform.

## Features Index

### Security & Engagement

- [2FA Enforcement](./features/2fa-enforcement.md) - Enforce two-factor authentication workspace-wide
- [Account Deletion](./features/account-deletion.md) - Self-serve data removal process
- [Cookie Consent](./features/cookie-consent.md) - Configurable GDPR privacy banners
- [Login Activity](./features/login-activity.md) - Visual history of account authentications
- [Workspace IP Allowlist](./features/workspace-ip-allowlist.md) - Restrict workspace access by origin IP
- [Password Expiry](./features/password-expiry.md) - Enforce rotating password compliance
- [Password Change History](./features/password-change-history.md) - Audit log of password modifications
- [Session Management](./features/session-management.md)

### Super Admin

- [Admin Panel](./features/admin-panel.md)
- [Announcements](./features/announcements.md) - Global broadcast messaging system
- [Audit Logs](./features/audit-logs.md) - High-fidelity system action tracking
- [Changelog](./features/changelog.md) - Public-facing release notes manager
- [Command Palette](./features/command-palette.md) - Omnipresent quick-action keyboard interface
- [Data Retention Policies](./features/data-retention.md) - Automated records pruning scheduler
- [Feature Flags](./features/feature-flags.md) - Incremental rollout toggles via Pennant
- [Maintenance Mode](./features/maintenance-mode.md) - Zero-downtime application pausing
- [Scheduled Tasks Monitor](./features/scheduled-tasks.md) - Read-only cron schedule monitor
- [System Health Monitor](./features/system-health.md) - Queue diagnostics and infrastructure monitor
- [Admin Application Log Viewer](./features/admin-log-viewer.md) - Inspect and manage system logs
- [Admin Impersonation](./features/impersonation.md) - Seamlessly log in as any user
- [Usage Dashboard](./features/usage-dashboard.md) - Consolidated view of workspace limits vs usage
- [Admin System Notifications](./features/admin-system-notifications.md) - Real-time alerts for super-admins regarding system events
- [API Rate Limiting Dashboard](./features/api-rate-limiting.md) - View workspace API consumption and throttled events
- [Admin User Sessions](./features/admin-user-sessions.md) - View and manage active user sessions
- [Admin Bulk User Actions](./features/bulk-user-actions.md)

### Core Functionality

- [Authentication & Access Control](./features/authentication.md)
- [Workspaces & Multi-tenancy](./features/workspaces.md)
- [Team Management & Roles](./features/team-management.md)
- [Granular Roles & Permissions](./features/granular-roles-permissions.md)
- [Permission Preset Templates](./features/permission-preset-templates.md)
- [Internationalization (i18n)](./features/internationalization.md)
- [Localization Management](./features/localization-management.md)
- [UI & Theming](./features/ui-and-theming.md)
- [Architecture & Security](./features/security.md)
- [User Timezone & Date Format](./features/user-timezone-date-format.md)
- [Advanced Global Search](./features/advanced-search.md)
- [SEO Management](./features/seo-management.md)

### Billing & Subscriptions

- [Billing & Subscriptions](./features/billing.md)
- [Seat-Based Billing](./features/seat-billing.md)
- [Revenue Analytics](./features/revenue-analytics.md)
- [Billing Reminder Notifications](./features/billing-reminder-notifications.md)

### Development & Integration

- [API Documentation](./features/api-documentation.md) - Scribe-generated API reference
- [User API Key Management](./features/user-api-keys.md) - Personal access token generation and management
- [Real-time Notifications](./features/real-time-notifications.md) - WebSocket event broadcasting
- [Webhooks](./features/webhooks.md) - Event-driven outbound webhooks with retry capabilities

### Notifications

- [Notification Channel Preferences](./features/notification-channel-preferences.md)
- [Notification Delivery Analytics](./features/notification-delivery-analytics.md)
- [Email Templates](./features/email-templates.md)

### Onboarding & Engagement

- [User Feedback Widget](./features/feedback.md)
- [Onboarding Completion Insights](./features/onboarding-completion-insights.md)
- [Onboarding Checklist](./features/onboarding-checklist.md)
- [Onboarding Wizard](./features/onboarding-wizard.md)
- [Shareable Invite Links](./features/invite-links.md)

### Workspace Management

- [2FA Enforcement per Workspace](./features/2fa-enforcement.md)
- [Workspace Member Activity Report](./features/member-activity-report.md)
- [Workspace Analytics Dashboard](./features/workspace-analytics.md)
- [Admin System Notifications](./features/admin-system-notifications.md)
- [Workspace Data Import (CSV)](./features/workspace-csv-import.md)
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
