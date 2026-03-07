# AI Continuous Development Roadmap

## 🤖 AI Workflow Instructions

**For the AI Agent (Read this every session!):**

1. **Initialize:** Read `AI_DIRECTIVES.md` FIRST to load core operational rules and autonomous user feedback. Then read this `AI_ROADMAP.md`.
2. **Total Autonomy:** You are the manager of this project. Do NOT ask the user what to do next. Select the next feature, plan it, execute it, and move forward.
3. **Select Task:** Pick the top-most uncompleted task from the **Active Sprint**.
4. **Execute:**
   - Start a planning phase (`task_boundary`).
   - Write/Update `implementation_plan.md` to dictate technical approach.
   - Execute the code changes and test them rigorously using Pest/Browser tests.
5. **Update:** Change `[ ]` to `[x]` for the task below, write a brief entry in the **Changelog**, log progress in `walkthrough.md`, and immediately proceed to the next task.

**For the User:**
The AI agent is now continually managing and executing the roadmap autonomously. You can interject at any point to provide new directives, but the agent will continuously drive development.

---

## 📌 Current State

- **Stack**: Laravel 12, Inertia.js v2, React 19, Tailwind CSS v4, Stripe Cashier, Fortify.
- **Completed Features**: Auth, 2FA, Workspaces, Teams, Stripe Billing, i18n, Dark Mode, Super Admin Panel, Feature Flags (Pennant), Announcements, Audit Logs, Command Palette.

## 🚀 Active Sprint 24: Advanced Integrations & UX

- [x] **Task 87**: Admin System Notifications — In-app notification system for super-admins about critical events (failed webhooks, subscription cancellations, system errors). ✅ (19 tests, 160 assertions)
- [x] **Task 88**: Workspace Data Import (CSV) — Allow workspace owners to bulk import team members via CSV upload with role assignment. ✅ (18 tests, 173 assertions)
- [x] **Task 89**: API Rate Limiting Dashboard — Per-workspace dashboard showing API key usage rates, throttled requests, and rate limit configuration. *(18 tests, 211 assertions)*
- [x] **Task 90**: User Session Management for Admins — Allow super-admins to view and terminate active user sessions from the admin panel. *(4 tests, 22 assertions)*
- [x] **Task 91**: Admin Application Log Viewer — Controller and UI for viewing, filtering, downloading, and deleting Laravel log files, restricted to super-admins. *(6 tests, 40 assertions)*
- [x] **Task 92**: User API Key Management UI — Allow users to generate, view, and revoke personal API keys from their account settings. *(5 tests, 24 assertions)*

## 🚀 Active Sprint 25: Admin Configuration & Growth

- [x] **Task 93**: Localization Management UI — Admin dashboard to view, edit, and save translation strings across supported JSON language files natively without requiring a code deployment.
- [x] **Task 94**: Global Support Ticket System — Allow users to submit support tickets, and provide a super-admin interface to manage, reply to, and close tickets. *(10 tests, 59 assertions)*
- [x] **Task 95**: Admin Dashboard Analytics Widgets — A visual dashboard in the admin panel displaying MRR, user growth, churn, and active workspaces using Recharts. *(1 test, 30 assertions)*

## 🚀 Active Sprint 26: Admin Security & Broadcasting

- [x] **Task 96**: Global Admin 2FA Enforcement — Add a mandatory security middleware for the `/admin` prefix routes requiring super-admins to have 2FA enabled before gaining access, redirecting them to a setup wall if disabled. *(7 tests, 19 assertions)*
- [x] **Task 97**: Impersonation Audit Log — Add a dedicated admin view to review an immutable audit trail of super-admins impersonating users, including timestamps, IP addresses, and user-agent data for security and privacy compliance. *(3 tests, 11 assertions)*
- [ ] **Task 98**: Admin Broadcast Notifications — A UI for super-admins to broadcast in-app messages and/or emails to all active platform users or specific segments (e.g., all workspace owners) natively via Laravel Notifications.

## 🏁 Completed Sprints

- **Sprint 25**: Admin Configuration & Growth (Localization Management UI, Global Support Ticket System, Admin Dashboard Analytics Widgets).
- **Sprint 24**: Advanced Integrations & UX (Admin System Notifications, Workspace Data Import, API Rate Limiting Dashboard, User Session Management, Admin Application Log Viewer, User API Key Management UI).

- **Sprint 22**: Communication & Conversion Reliability (Notification Delivery Analytics, Onboarding Completion Insights, Billing Reminder Notifications, Permission Preset Templates).

- **Sprint 21**: Permissions Deepening & Onboarding Quality (Granular Team Permission Parity, Permission Matrix UI Polish, Onboarding Billing Step, Notification Channel Preferences).

- **Sprint 20**: Resilience & Self-Service (Workspace Trash & Restore, Password Change History, Workspace Suspension, User Timezone & Date Format).

- **Sprint 19**: Identity & Compliance (Magic Link Authentication, Cookie Consent Manager, Workspace IP Allowlist, Robust Avatar Management).
- **Sprint 18**: Enterprise Security & Billing Polish (Invoice PDF, Webhook Dispatching, Maintenance IP Whitelist, Password Expiry).
- **Sprint 17**: Collaboration & Admin Polish (Contextual Help Tooltips, Workspace Activity Feed, Admin User Analytics, Notification Preferences).
- **Sprint 16**: Security & Customization (Shareable Invitation Links, Login Activity Log, Admin Maintenance Mode, Workspace Custom Branding).
- **Sprint 15**: Engagement & User Success (Account Deletion, Usage Dashboard, Admin Impersonation UI, SEO Management).
- **Sprint 14**: Developer Experience & Growth (API Documentation, Real-time Notifications, Data Export, Advanced Search).

- **Sprint 13**: Platform Maturity & Visibility (System Health Monitor, Public Changelog, Workspace API Keys, Scheduled Tasks Monitor).

- **Sprints 1-8**: Core SaaS Mechanics, Admin Dashboard, Webhooks, Sentry, Activity Logs, Settings, UI refinement.
- **Sprint 9**: Developer Experience & Integration (Feature Flags, Announcements, Command Palette).
- **Sprint 10**: Deep Review & Polish (Documentation generated: UI/Theming, Workspaces, I18N, Billing, Security; Landing Page enhanced).
- **Sprint 11**: Application Polish & Engagement (Webhook Event Log, Email Templates, Feedback Widget).
- **Sprint 12**: Enterprise Mechanics (Seat-Based Billing, Data Retention, 2FA Enforcement).

## 📝 Changelog

- **2026-03-07**: Task 97 (Impersonation Audit Log): Added dedicated `ImpersonationLog` model/migration, hooked into `ImpersonationController`, and created admin UI to view immutable session trails. 3 tests/11 assertions.
- **2026-03-07**: Task 96 (Global Admin 2FA Enforcement): Implemented `RequireAdminTwoFactor` middleware, applied to all `/admin` routes, forcing a setup wall for super-admins without 2FA. 7 tests/19 assertions.
- **2026-03-07**: Task 95 (Admin Dashboard Analytics Widgets): Implemented MRR and 30-day Churn calculations in `DashboardController`, added Recharts NPM dependency, replaced simple CSS sparklines with interactive `AreaChart` and `PieChart` components on the super-admin dashboard.
- **2026-03-07**: Task 94 (Global Support Ticket System): Implement user ticket portal, admin ticket management dashboard, Ticket/TicketReply models, threaded conversation UI with Sonner toasts. 10 tests/59 assertions.
- **2026-03-07**: Task 93 (Localization Management UI): Added TranslationController, admin UI (`translations.tsx`), and tests to directly edit and create translation JSON files dynamically. 7 tests/39 assertions.
- **2026-03-06**: Task 90 (User Session Management for Admins): Controller and admin UI for viewing and terminating remote user sessions directly from the user management screen, 4 tests/22 assertions.
- **2026-03-05**: Sprint 22 complete. Task 82 (Permission Preset Templates): admin CRUD for reusable permission bundles, preset selector in team permissions dialog, 4 default presets seeded, 13 tests/54 assertions.
- **2026-03-05**: Task 83 (Admin Revenue Analytics): admin dashboard with MRR calculation, churn rate, trial conversion rate, plan distribution, subscription flow chart, revenue-by-plan breakdown, status alerts, 12 tests/149 assertions.
- **2026-03-05**: Task 84 (Admin Bulk User Actions): checkbox selection on admin users page, bulk verify email, bulk suspend with self-exclusion, CSV export with streamed download, 10 tests/27 assertions.
- **2026-03-05**: Task 85 (Workspace Member Activity Report): per-member engagement dashboard with login frequency, action counts, engagement scores (0-100), online/recent/inactive status detection, 14-day daily activity chart, settings layout integration, 13 tests/128 assertions.
- **2026-03-05**: Task 86 (Workspace Analytics Dashboard): per-workspace usage metrics with member growth (6mo chart), API key usage listing, webhook delivery stats (success/failed/pending), 8-week activity volume chart, recent activity feed, settings layout integration, 10 tests/123 assertions.
- **2026-03-05**: Task 81 (Billing Reminder Notifications): TrialEndingNotification and SubscriptionRenewalNotification with channel/category preference respect, app:send-billing-reminders artisan command scheduled daily at 09:00 UTC, deduplication via billing_reminder_logs table, 19 tests/53 assertions.
- **2026-03-05**: Task 80 (Onboarding Completion Insights): admin funnel dashboard showing per-step viewed/completed unique counts, drop-off analysis with severity coloring, daily completions chart, average completion time; frontend step tracking via router.post, 9 tests/76 assertions.
- **2026-03-05**: Task 79 (Notification Delivery Analytics): admin dashboard for per-channel email/in_app delivery metrics, daily stacked chart, category breakdown, type table, week-over-week trend; LogNotificationDelivery listener on NotificationSent event, 9 tests/92 assertions.
- **2026-03-05**: Sprint 21 complete. Task 78 (Notification Channel Preferences): added per-channel toggles for email and in-app delivery, normalized legacy preference payloads to channels/categories schema, updated notification delivery logic for `DataExportCompleted`, and added feature/unit coverage for channel behavior.
- **2026-03-05**: Task 77 complete. Onboarding wizard now includes an optional plan-selection step; paid-intent users are redirected to billing plans with recommendation query params and contextual onboarding guidance.
- **2026-03-05**: Task 76 complete. Team permission matrix UI now groups capabilities by access domain (Team, Billing, Operations) with clearer labels/descriptions while preserving existing permission IDs and backend policy behavior.
- **2026-03-05**: Sprint 21 started. Task 75 (Granular Team Permission Parity): invite-link create/revoke now authorizes through `manageTeam` policy/capability path, members with explicit `manage_team` permission can operate invite links, demo data includes granular-permission member examples, and invite-link tests expanded for permission-granted members.
- **2026-03-05**: Sprint 20 complete. Task 71 (Workspace Trash & Restore): owner trash view, restore + force delete actions, scheduled pruning command, 9 tests. Task 72 (Password Change History): audit trail with IP/user-agent/timestamp in password settings, 5 tests. Task 73 (Workspace Suspension): superadmin suspend/unsuspend flow, suspension middleware + branded wall page, 5 tests. Task 74 (User Timezone & Date Format): profile preferences with validation and shared props hydration, 3 tests.
- **2026-03-05**: Sprint 19 complete. Task 67 (Magic Link Authentication): stateless signed URL login, 6 tests. Task 68 (Cookie Consent Manager): GDPR-compliant banner with granular preferences, privacy settings page. Task 69 (Workspace IP Allowlist): middleware, admin UI, 7 tests. Task 70 (Robust Avatar Management): async upload/delete controllers, image cropping, fallback avatars, 10 tests. Total: 23+ tests.
- **2026-03-05**: Sprint 16 complete. Task 55 (Shareable Invitation Links): reusable join links with max uses, expiry, role assignment, public join page, 13 tests. Task 56 (Login Activity Log): event listeners for Login/Failed, UA parsing, settings page, 9 tests. Task 57 (Admin Maintenance Mode): cache-based artisan down/up toggle with bypass secret, admin page, 5 tests. Task 58 (Workspace Custom Branding): accent_color migration, color picker with preset swatches and live preview, 5 tests. Total: 32 tests, 126 assertions.
- **2026-02-28**: Sprint 15 complete. Task 51 (Account Deletion): password-confirmed soft-delete with workspace cleanup, subscription cancellation, 4 tests. Task 52 (Usage Dashboard): visual plan limits vs current usage for workspaces/members/API keys/webhooks, PlanLimitService, sidebar nav, 4 tests. Task 53 (Admin Impersonation UI): impersonate/leave controller, persistent banner, session-based identity swap, 4 tests. Task 54 (SEO Management): admin CRUD for per-page and global meta tags (OG + Twitter Card), shared Inertia prop, seeder data, 10 tests.
- **2026-02-26**: Comprehensive Test Audit. Verified 332 tests passing across all layers. Full coverage for Console Commands, Models (FeatureFlag, WorkspaceApiKey), and Policies (WebhookEndpointPolicy). Fixed all session regressions.
- **2026-02-25**: Task 44 (Scheduled Tasks Monitor). Read-only admin page introspecting Laravel Schedule with cron parsing, next-due calculation, flag badges, 8 tests.
- **2026-02-25**: Task 43 (Workspace API Keys). wsk_-prefixed keys, SHA-256 hash storage, 5 scopes, expiry, revocation, admin-only management, 9 tests.
- **2026-02-25**: Task 42 (Changelog). Admin CRUD for versioned release notes, public timeline page, typed entries (feature/improvement/fix), draft support, 9 seeder entries, 9 tests.
- **2026-02-25**: Task 41 (System Health). Admin dashboard with queue stats, infrastructure drivers, storage usage, failed job management (retry/delete/flush), 7 tests.
- **2026-02-25**: Task 40 (2FA Enforcement). RequireTwoFactor middleware, workspace security settings toggle, enforcement wall page, 7 tests.
- **2026-02-25**: Task 39 (Data Retention). Config-driven pruning, daily scheduler, admin trigger UI with dry-run.
- **2026-02-25**: Task 37 (Seat-Based Billing). Workspace seat helpers, Stripe quantity sync, seat meter on billing page.
- **2026-02-25**: Completed Sprint 11 (Tasks 29, 34, 35). Webhook delivery logs, database-driven email templates, in-app feedback widget with admin review panel.
- **2026-02-25**: Completed Sprint 10 (Tasks 31-33). Wrote extensive markdown documentation detailing architecture mapping to all physical features. Enhanced frontend landing page to showcase precise value capabilities.
- **2026-02-25**: Completed Sprint 9 (Tasks 28, 30). Built interactive Announcement banner arrays resolving natively via global middleware payload. Bootstrapped native Laravel Pennant integration pushing targeted rollout caches downstream linearly to Inertia.
- **2026-02-25**: Completed Task 14 (Command Palette). Replaced conventional user navigation with CMDK interactive abstractions.
