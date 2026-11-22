# Project Documentation

Guides for running this repository, then notes for each feature that has a page under `docs/features/`.

The locked stack is PHP 8.4, Laravel 13.40.0, Inertia Laravel 3.1.1 and Inertia React 3.7.0, React 19.2.7, and Tailwind CSS 4.3.2. See the table in the [README](../README.md). Older pages that say Laravel 12 or Inertia v2 are out of date.

## Run and deploy

- [Getting started](./getting-started.md) — local boot and turning the kit into a product
- [Environment variables](./environment.md) — every `.env.example` name, plus keys the config reads
- [Queues and scheduler](./queues-and-scheduler.md)
- [Docker](./docker.md)
- [Coolify](./deploy-coolify.md)
- [Tests](./testing.md)

## Features Index

- [Authentication & Access Control](./features/authentication.md)
- [Workspaces & Multi-tenancy](./features/workspaces.md)
- [Team Management & Roles](./features/team-management.md)
- [Billing & Subscriptions](./features/billing.md)
- [Seat-Based Billing](./features/seat-billing.md)
- [Admin Panel](./features/admin-panel.md)
- [Audit Logs](./features/audit-logs.md)
- [Global Announcements](./features/global-announcements.md)
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
- [API Usage Dashboard](./features/api-usage-dashboard.md)
- [Real-time Notifications](./features/real-time-notifications.md)
- [Notification Channel Preferences](./features/notification-channel-preferences.md)
- [Notification Delivery Analytics](./features/notification-delivery-analytics.md)
- [Onboarding Completion Insights](./features/onboarding-completion-insights.md)
- [Billing Reminder Notifications](./features/billing-reminder-notifications.md)
- [Permission Preset Templates](./features/permission-preset-templates.md)
- [Revenue Analytics](./features/revenue-analytics.md)
- [Admin Bulk User Actions](./features/bulk-user-actions.md)
- [Admin User Session Management](./features/admin-user-session-management.md)
- [Admin Application Log Viewer](./features/admin-log-viewer.md)
- [Admin User API Key Management](./features/admin-user-api-key-management.md)
- [Localization Management](./features/localization-management.md)
- [Global Support Ticket System](./features/support-tickets.md)
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
- [In-App Product Tour](./features/product-tour.md)
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
- [Workspace Email Domain Restriction](./features/workspace-domain-restriction.md)
- [Weekly Workspace Activity Digest](./features/weekly-workspace-digest.md)
- [Admin Cohort Retention Analysis](./features/admin-cohort-analysis.md)
- [User Last Seen Timestamp](./features/user-last-seen.md)
- [User Login Methods Summary](./features/security-summary.md)
- [Session Activity Summary](./features/session-summary.md)
- [Activity Reactions](./features/activity-reactions.md)
- [Billing History](./features/billing-history.md)
- [Cancellation Flow](./features/cancellation-flow.md)
- [Plan Comparison](./features/plan-comparison.md)
- [Public Status Page](./features/public-status-page.md)
- [User API Keys](./features/user-api-keys.md)
- [Workspace Announcements](./features/workspace-announcements.md)
- [Workspace Comments](./features/workspace-comments.md)
- [Connected Accounts](./features/connected-accounts.md)
- [Workspace Retention Insights](./features/workspace-retention-insights.md)

## Development Directives

> **Important Rule:** Whenever a new feature is built or an existing feature undergoes major architectural changes, its corresponding documentation file in `docs/features/` must be created or updated.

### Tech Stack

- Frontend: React 19.2, Inertia React 3, Tailwind CSS 4, shadcn/ui
- Backend: Laravel 13, PHP 8.4
- Database: SQLite by default; MySQL, MariaDB, and PostgreSQL connections are in `config/database.php`
- Testing: Pest 4 feature and unit tests (`tests/Feature`, `tests/Unit`). No browser suite is checked in.
