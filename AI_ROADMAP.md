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

## 🚀 Active Sprint 30: Engagement & Observability

- [x] **Task 123**: In-App Changelog Widget — `changelog_read_at` on users, `ChangelogWidgetController` (index + mark-read), `ChangelogWidget` popover component with unread badge, mounted in app header. ✅ (9 tests, 20 assertions)
- [x] **Task 124**: Workspace Activity Feed — `WorkspaceActivityController::feed()` at `GET /workspace-activity-feed` returns last 5 workspace activities as JSON, `WorkspaceActivityFeed` card widget mounted on dashboard with loading skeleton and empty state. ✅ (8 tests, 25 assertions)
- [x] **Task 125**: Admin Revenue Export CSV — `RevenueAnalyticsController::export()` at `GET /admin/revenue-analytics/export` streams CSV with workspace name, plan, billing interval, status, MRR, quantity, dates. Export CSV button added to revenue analytics page. ✅ (7 tests, 17 assertions)
- [x] **Task 126**: Webhook Signature Verification Guide — `WebhookEndpointController::verificationGuide()` at `GET /workspaces/{workspace}/webhooks/verification-guide`, Inertia page with step-by-step explanation, PHP/Node.js/Python code samples with copy buttons, link from webhooks index. ✅ (6 tests, 41 assertions)
- [x] **Task 127**: User Profile Completeness Score — `User::profileCompletenessScore()` checks avatar, bio, non-UTC timezone, 2FA (4 checks × 25 pts each), shared as `auth.user.profile_completeness` via Inertia middleware, progress bar card on profile settings page when < 100%. ✅ (8 tests, 29 assertions)

## 🚀 Active Sprint 36: Developer Experience & Admin Power Tools

- [x] **Task 153**: Workspace API Key Last Used Timestamp — `last_used_at` column + `recordUsage()` were pre-existing; enhanced display from absolute date to `formatDistanceToNow()` relative time on API keys page. ✅ (4 tests, 34 assertions)
- [x] **Task 154**: Admin Impersonation Audit Log — `ImpersonationController::impersonate()` now logs Spatie activity entry (event=`impersonated`, causer=admin, subject=target); `GET /admin/users/{user}` show page with impersonation history + activity log; "View Detail" added to admin users dropdown. ✅ (5 tests, 40 assertions)
- [x] **Task 155**: Workspace Onboarding Progress Bar — `WorkspaceController::computeOnboardingProgress()` computes 5-step score (has_logo, has_members, has_webhook, has_api_key, owner_has_2fa); `onboardingProgress` prop in `settings()` Inertia response; progress bar card with step checklist on workspace settings page (hidden when 100%). ✅ (6 tests, 69 assertions)
- [x] **Task 156**: Super Admin Quick Stats Widget — `DashboardController::quickStats()` at `GET /admin/quick-stats` returns JSON (total_users, total_workspaces, mrr); `AdminQuickStatsWidget` fetches and renders a compact 3-column stat bar in the admin sidebar footer with loading skeleton. ✅ (4 tests, 10 assertions)
- [x] **Task 157**: User Last Seen Timestamp — Track `last_seen_at` on users (updated on each authenticated web request via middleware); display in admin user list and workspace team member list. ✅ (6 tests, 34 assertions)
- [x] **Task 158**: User Login Methods Summary — `SecuritySummaryController` at `GET /settings/security-summary` returns JSON with password status, 2FA status, connected social accounts, security score (0-100), and recommendations; `SecuritySummaryCard` React component displays on profile settings with visual indicators and quick action links. ✅ (12 tests, 48 assertions)
- [x] **Task 159**: Session Activity Summary — `SessionSummaryController` at `GET /settings/session-summary` returns session count, current device info, and other sessions summary; `SessionSummaryCard` component on profile settings shows active sessions with "Sign Out All Other Devices" action; integrates with existing `SessionController` revoke functionality. ✅ (8 tests, 24 assertions)

## 🚀 Active Sprint 40: Advanced Workspace Features & Automation

- [x] **Task 170**: Workspace Templates — Template system for rapid workspace creation. `WorkspaceTemplate` model with JSON configuration storage. `WorkspaceTemplateController` with index/store/show/update/destroy/use/duplicate endpoints. `WorkspaceTemplateService` extracts configuration from source workspaces and applies to new workspaces. Supports public/private templates, categories, and usage tracking. 12 Pest tests. ✅
- [x] **Task 171**: Advanced Workspace Search — Unified search across workspace content. `WorkspaceSearchController` searches activities, comments, announcements, and members. Faceted results with type filtering. Suggestions endpoint for autocomplete. 5 Pest tests. ✅
- [x] **Task 172**: Workspace Tags/Labels — Polymorphic tagging system with `tags` and `taggables` tables. Color-coded labels with preset palette. `TagController` with CRUD, attach/detach, and available tags endpoints. Global and workspace-specific tags supported. 13 Pest tests. ✅
- [x] **Task 173**: Custom Workspace Fields — Extensible custom field system with `custom_field_definitions` and `custom_field_values` tables. Supports 7 field types: text, textarea, number, date, boolean, select, url. Field validation, type casting, and reordering. 12 Pest tests. ✅

## 🏁 Completed Sprint 39: Team Collaboration & Communication

- [x] **Task 166**: Workspace Comments/Discussions — Created polymorphic comment system with `workspace_comments` table supporting threaded replies. `WorkspaceCommentController` with index/store/update/destroy/replies endpoints. `MentionService` to extract @username mentions from content. 12 Pest tests with comprehensive coverage for CRUD, authorization, and nested replies. ✅
- [x] **Task 167**: @Mentions System with Notifications — `UserMentioned` notification with email+database channels respecting user preferences. `MentionService::processMentions()` automatically extracts and notifies mentioned users when comments are created. Excludes self-mentions. Integrated into comment creation flow. ✅
- [x] **Task 168**: Workspace-Level Announcements — `WorkspaceAnnouncement` model with types (info/warning/success), pinning, dismissal tracking, and expiry dates. `WorkspaceAnnouncementController` with full CRUD, dismiss, and pin endpoints. `workspace_announcement_reads` pivot table tracks per-user read status. 14 Pest tests with coverage for permissions, expiry, and read tracking. ✅
- [x] **Task 169**: Activity Reactions (Emoji) — `ActivityReaction` model with toggle functionality. `ActivityReactionController` with store/destroy/index endpoints. `getGroupedForActivity()` aggregates reactions by emoji with counts and user IDs. Real-time broadcast via Reverb on reaction changes. 12 Pest tests covering toggle behavior and grouping. ✅

## 🏁 Completed Sprint 38: Customer-Facing Billing Experience

- [x] **Task 163**: Plan Comparison Table — Created `/billing/compare` page with side-by-side feature comparison for all plans (Free, Pro, Business). Includes monthly/yearly billing toggle with 20% savings indicator. Shows team member limits, workspace limits, storage, and feature matrix. Highlights current plan. FAQ section with common questions. "Compare Plans" button added to billing index page. 6 Pest tests with 61 assertions. ✅
- [x] **Task 164**: Enhanced Billing History — Created `/billing/history` page with full invoice history. Features date filtering (30/90/365 days), search by date/amount/invoice ID, stats cards showing total invoices, filtered amount, and last invoice date. Clean list view with PDF download buttons. "View History" link from billing page. 5 Pest tests with 46 assertions. ✅
- [x] **Task 165**: Self-Service Cancellation with Retention — Created `CancellationFlow` component with 4-step process: 1) Reason selection with feedback, 2) Contextual retention offer based on reason (discount, downgrade suggestion, feature roadmap), 3) Final confirmation with impact details, 4) Success state. Integrated into billing page with "Cancel Subscription" button. Collects cancellation analytics. 5 Pest tests with 6 assertions. ✅

## 🏁 Completed Sprint 37: Settings Architecture & UX Refinement

- [x] **Task 160**: Profile Settings Reorganization — Reorganized profile settings from 11 flat items into 4 logical sections (Profile, Security, Privacy, Support). Merged Password + 2FA into combined "Authentication" page. Moved Appearance (theme toggle) into General/Profile page. Renamed "Privacy & Cookies" to "Cookies". Moved Security Summary and Session Summary cards from Profile to Authentication page for better logical grouping. Updated all layouts (profile-layout.tsx, workspace-layout.tsx) with new navigation structure. Added redirects for backward compatibility. ✅
- [x] **Task 161**: Workspace Settings Menu Enhancement — Added "Workspace Settings" link to main sidebar for quick access. Improved workspace settings layout organization with consistent icons for all menu items. Added test users (superadmin, admin, demo) as admins to "Startup Hub" workspace in seeder for full feature testing. ✅
- [x] **Task 162**: Settings Menu Navigation Fixes — Fixed user menu dropdown to have clear separation between "Workspace Settings" and "Profile Settings". Removed redundant menu items. Ensured all menu items have proper icons. ✅

## 🏁 Completed Sprint 35: Security, Observability & Quality-of-Life

- [x] **Task 148**: Workspace Audit Log Export — `WorkspaceActivityController::export()` at `GET /workspaces/{workspace}/activity/export` streams CSV (Date, Event, Causer, Subject Type, Description); "Export CSV" button added to workspace activity page. ✅ (7 tests, 24 assertions)
- [x] **Task 149**: Admin User Export CSV — `UserController::export()` at `GET /admin/users/export` streams CSV (ID, Name, Email, Superadmin, Workspaces, Email Verified, Created At, Deleted At); "Export All" button added next to search on admin users page. ✅ (7 tests, 23 assertions)
- [x] **Task 150**: Workspace Member Count Limit Warning — When `canInvite` is false, amber `Alert` card renders at top of team page with `memberLimitMessage` text and "Upgrade Plan" CTA linking to billing. ✅ (5 tests, 57 assertions)
- [x] **Task 151**: Login Streak Tracker — `User::currentLoginStreak()` and `longestLoginStreak()` computed from `login_activities`; shared via `ProfileController::edit()` as `loginStreak`; displayed as a streak card on profile settings page. ✅ (11 tests, 25 assertions)
- [x] **Task 152**: Admin Dashboard Sparklines — `DashboardController` computes 7-day `sparklines` (new_users, new_workspaces, new_subscriptions); inline SVG `Sparkline` polyline component renders in all 4 metric cards on admin dashboard. ✅ (4 tests, 54 assertions)

## 🏁 Completed Sprint 34: Power UX & Platform Hardening

- [x] **Task 143**: Workspace Member Search & Filter — search input with clear button filters members by name/email client-side; role filter dropdown (All/Owner/Admin/Member/Viewer); results count badge in title when active; empty state with "Clear filters" link. ✅ (5 tests, 47 assertions)
- [x] **Task 144**: Admin Workspace Usage Heatmap — `GET /admin/workspace-activity-heatmap` aggregates `api_request_logs` daily counts for last 52 weeks; React page renders GitHub-style contribution heatmap with color-coded cells, month labels, legend, and 3-stat summary row. ✅ (5 tests, 48 assertions)
- [x] **Task 145**: Two-Factor Recovery Code Regeneration — Fortify's `POST /user/two-factor-recovery-codes` already wired; "Regenerate Codes" button already in `TwoFactorRecoveryCodes` component (shown when codes visible); tested in `TwoFactorFlowTest`. ✅ (pre-existing)
- [x] **Task 146**: Workspace Billing Email Override — nullable `billing_email` on workspaces migration; `WorkspaceRequest` validates email format; `WorkspaceService::update()` persists it; billing email card added to workspace settings page. ✅ (5 tests, 18 assertions)
- [x] **Task 147**: Admin Broadcast System Message — `BroadcastController` + `DispatchBroadcastMessage` job + `PlatformBroadcast` notification already existed; added optional `action_url` column (migration + validation + `toArray()`); action URL field added to broadcast form UI. ✅ (6 tests, 21 assertions)

## 🏁 Completed Sprint 33: Analytics, Automation & Developer Ergonomics

- [x] **Task 138**: Workspace Invitation Expiry — `expires_at` already on model (7-day default); added `POST /team/invitations/{invitation}/resend` endpoint that resets expiry + resends notification; "Resend" button + "Expired" badge added to pending invitations list in team page. ✅ (8 tests, 19 assertions)
- [x] **Task 139**: Admin User Impersonation Audit Trail — `ImpersonationLog` model and index page already existed; added `GET /admin/impersonation-logs/export` CSV endpoint + Export CSV button to the impersonation logs page. ✅ (5 tests, 23 assertions)
- [x] **Task 140**: Workspace Transfer Ownership — `POST /team/transfer-ownership/{user}` swaps `owner_id` + updates pivot roles; Danger Zone page updated with Select dropdown (admin users), confirmation step, owner-only guard; `WorkspaceController::dangerZone()` passes `admins` list. ✅ (6 tests, 13 assertions)
- [x] **Task 141**: Notification Read-All Button — `POST /api/notifications/mark-all-read` already implemented in `NotificationController::markAllAsRead()`; "Mark all as read" button present in both notifications dropdown and full notifications page. ✅ (pre-existing)
- [x] **Task 142**: API Key Last-Used At — `last_used_at` already on `workspace_api_keys` migration; `AuthenticateApiKey` middleware calls `$apiKey->recordUsage()` on every request; displayed in API keys table. ✅ (pre-existing)

## 🏁 Completed Sprint 32: Compliance, Power Features & UX Polish

- [x] **Task 133**: Workspace Member Bulk Actions — checkboxes on team member rows, floating action bar when members selected, `POST /team/bulk-action` endpoint supporting `remove` and `change_role` actions on multiple user IDs. ✅ (12 tests, 29 assertions)
- [x] **Task 134**: GDPR User Data Export — Enhanced existing `ExportPersonalDataJob` to include `login_history` (last 500 login activities) and `notifications` (last 500 database notifications) in the ZIP export alongside profile, workspaces, and connected accounts. ✅ (5 tests, 13 assertions)
- [x] **Task 135**: Admin Workspace Plan Override — `plan_override` nullable varchar on workspaces table, superadmin can set/clear via `POST /admin/workspaces/{id}/override-plan`, `plan_name` resolves override first. "Override Plan" menu item + dialog in admin workspaces table. ✅ (8 tests, 15 assertions)
- [x] **Task 136**: Workspace Settings Quick Stats — compact stats row at top of workspace settings page (total members, plan, workspace age, API keys count). Makes the settings page richer at a glance. ✅ (6 tests, 12 assertions)
- [x] **Task 137**: Custom Error Pages — `resources/js/pages/error.tsx` React page handles 403/404/429/500/503 with themed layout and back/home buttons. Registered via `$exceptions->respond()` in `bootstrap/app.php` — only renders Inertia error page for `X-Inertia` requests. ✅ (5 tests, 9 assertions)

## 🏁 Completed Sprint 31: Retention, Insights & Developer Tools

- [x] **Task 128**: Workspace Retention Insights Widget — `WorkspaceRetentionController::index()` at `GET /workspace-retention-insights`, returns total_members/active_last_30_days/retention_rate JSON, `WorkspaceRetentionWidget` card with progress bar and color-coded rate, placed alongside Activity Feed on dashboard in a 2-column grid. ✅ (8 tests, 19 assertions)
- [x] **Task 129**: API Request Log Viewer — `ApiUsageController::logs()` at `GET /workspaces/api-usage/logs`, paginated (15/page) Inertia page with method/status-group/path filters, color-coded method badges and status codes, throttled indicator, "View Request Logs" button added to api-usage dashboard. ✅ (10 tests, 112 assertions)
- [x] **Task 130**: Workspace Danger Zone — `WorkspaceController::dangerZone()` + `leave()`, `GET /settings/workspace-danger-zone` page with delete workspace (owners, name-confirm guard), leave workspace (non-owners, confirm step), transfer ownership link, personal workspace notice. "Danger Zone" added to settings sidebar. ✅ (10 tests, 52 assertions)
- [x] **Task 131**: Global Search (Admin) — `AdminSearchController::search()` at `GET /admin/search?q=`, returns users (name/email match), workspaces (name/slug match), subscriptions (owner/status/price match), max 5 per category. `AdminSearchBar` component with debounce + click-outside dismiss mounted in admin sidebar. ✅ (10 tests, 24 assertions)
- [x] **Task 132**: Notification Digest Preview Command — `app:preview-weekly-digest {workspace}` Artisan command, accepts workspace ID or slug, prints subject, greeting, email body lines, action button, and stats summary (members, delta, activity count) to terminal without sending. ✅ (6 tests, 12 assertions)

## 🏁 Completed Sprint 29: User Trust & Admin Control

- [x] **Task 118**: Connected Social Accounts Settings — `ConnectedAccountController` with `index()` / `destroy()`, nullable `password` migration, provider cards (GitHub/Google) with connect/disconnect UI, safety guard preventing disconnect of last login method, settings nav entry. ✅ (9 tests, 60 assertions)
- [x] **Task 119**: Admin User Notes — `user_notes` table + `UserNote` model, `UserNoteController` (index/store/destroy), notes dialog in admin users page with inline fetch, add/delete UI. ✅ (9 tests, 22 assertions)
- [x] **Task 120**: Workspace Slug Edit — dedicated slug edit tests, slug normalisation via `Str::slug()`, uniqueness guard, member permission check, warning banner in settings UI when slug changes. ✅ (7 tests, 24 assertions)
- [x] **Task 121**: API Key Expiry Alerts — `ApiKeyExpiryNotification` (security category, email+in-app), `app:send-api-key-expiry-alerts` command with 1/3/7-day warning thresholds + `--dry-run`, scheduled daily at 08:00 UTC. ✅ (8 tests, 16 assertions)
- [x] **Task 122**: Workspace Member CSV Export — `TeamController::exportMembers()` at `GET /team/export-members`, CSV columns (ID, Name, Email, Role, Timezone, Joined At), admin/owner-only gate, Export CSV button in team page. ✅ (7 tests, 18 assertions)

## 🏁 Completed Sprint 28: Platform Polish & Developer Experience

- [x] **Task 113**: Webhook Log Redelivery
- [x] **Task 114**: Audit Log CSV Export
- [x] **Task 115**: Workspace Plan Usage Alerts
- [x] **Task 116**: Announcement Scheduling
- [x] **Task 117**: Full Notification History Page

## 🏁 Completed Sprint 27: Enterprise & Growth Hardening

- [x] **Task 108**: Workspace Email Domain Restriction — `allowed_email_domains` JSON column, `Workspace::isEmailDomainAllowed()` helper, enforcement on invitation acceptance and invite-link joins, domain restriction card in security settings UI. ✅ (11 tests, 18 assertions)
- [x] **Task 109**: Weekly Workspace Activity Digest Email — `WeeklyWorkspaceDigestNotification` with team category + channel preference enforcement, `app:send-weekly-digests` command scheduled Monday 08:00 UTC with `--dry-run` support. ✅ (7 tests, 14 assertions)
- [x] **Task 110**: Admin Cohort Retention Analysis — triangular cohort table at `/admin/cohort-analysis` with 6-month history, 3 retention months, colour-coded cells (green/amber/red), average row, admin nav entry. ✅ (5 tests, 72 assertions)
- [x] **Task 111**: Public Status Page — `StatusIncident` model with `scopeRecent()` / `isActive()` / `isResolved()`, public `/status` page with overall status banner (operational/degraded/outage/maintenance), admin CRUD at `/admin/status` with inline create/edit form and auto-resolve logic, 3 seeded sample incidents. ✅ (17 tests, 114 assertions)
- [x] **Task 112**: In-App Product Tour — `tour_completed_at` column on users, `TourController::complete()` at `POST /tour/complete`, `use-tour.ts` hook with 4 steps, `ProductTour` + `TourTooltip` components with backdrop, highlight ring, progress dots, Next/Skip/Done, mounted on dashboard for users with `!tour_completed_at`. ✅ (3 tests, 4 assertions)

## 🏁 Completed Sprint 26: Team Role UX Reliability

- [x] **Task 99**: Team Role Action Parity & Viewer Flow Coverage — Replace ambiguous role toggle actions with explicit role transitions in Team UI and validate viewer-role transitions across member updates and invite links. ✅ (4 tests, 20 assertions)
- [x] **Task 100**: Team Permission Input Guardrails — Enforce allowed granular permission identifiers on team member permission updates and validate accepted/rejected payload paths. ✅ (2 tests, 4 assertions)
- [x] **Task 101**: Invite Link Seat-Limit Enforcement — Prevent invite-link joins from bypassing workspace member limits and validate blocked-join behavior when limits are reached. ✅ (1 test, 2 assertions)
- [x] **Task 102**: Self Role-Change Protection — Prevent team managers from changing their own role through direct requests and validate role integrity. ✅ (1 test, 2 assertions)
- [x] **Task 103**: Self Permission-Edit Protection — Prevent team managers from changing their own granular permissions via direct requests and validate integrity safeguards. ✅ (1 test, 2 assertions)
- [x] **Task 104**: Admin Granular Permission Lock — Prevent granular-permission mutations for admin-role users through direct requests and validate role-policy parity. ✅ (1 test, 2 assertions)
- [x] **Task 105**: Non-Member Role Update Guard — Return not-found for role-update requests targeting users outside the current workspace and validate membership boundaries. ✅ (1 test, 1 assertion)
- [x] **Task 106**: Invite Link Creation Seat Guard — Prevent creating new invite links when workspace team-member limits are reached to avoid unusable links. ✅ (1 test, 2 assertions)
- [x] **Task 107**: Team Invite-Link Capacity UX Sync — Disable invite-link creation action in Team UI when workspace capacity is reached and validate `canInvite` contract. ✅ (1 test, 1 assertion)

## 🏁 Completed Sprints

- **Sprint 25**: Admin Experience Completion (Localization Management Recovery, Support Tickets Recovery, Admin Dashboard Analytics Validation, Admin 2FA Enforcement Recovery, Impersonation Audit Log Recovery, Admin Broadcast Recovery).

- **Sprint 24**: Advanced Integrations & UX (Admin System Notifications, Workspace Data Import, API Rate Limiting Dashboard, User Session Management, Admin Application Log Viewer, User API Key Management UI).

- **Sprint 23**: Operational Excellence & Growth (Admin Revenue Analytics, Admin Bulk User Actions, Workspace Member Activity Report, Workspace Analytics Dashboard).

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

- **2026-03-23**: Sprint 40 (Advanced Workspace Features): Task 170 (Workspace Templates) — template system for rapid workspace creation with JSON configuration, public/private visibility, categories. Task 171 (Advanced Search) — unified search across activities, comments, announcements, members with faceted results. Task 172 (Workspace Tags) — color-coded labels with polymorphic tagging system. Task 173 (Custom Fields) — extensible field system with 7 field types, validation, and reordering. 42 Pest tests with 91 assertions. ✅

- **2026-03-23**: Sprint 39 (Team Collaboration & Communication): Task 166 (Workspace Comments) — polymorphic comment system with threaded replies, `MentionService` for @username extraction, full CRUD endpoints. Task 167 (@Mentions) — `UserMentioned` notification with email+database channels. Task 168 (Workspace Announcements) — announcement system with pinning, dismissal tracking, expiry dates, and read status. Task 169 (Activity Reactions) — emoji reactions with toggle functionality and real-time broadcasts. 38 Pest tests with 90 assertions. ✅

- **2026-03-22**: Task 165 (Self-Service Cancellation): Created `CancellationFlow` component with multi-step cancellation process. Step 1: Reason selection with optional feedback. Step 2: Contextual retention offers (discount, downgrade suggestion, pause option). Step 3: Final confirmation with clear impact details. Step 4: Success confirmation. Integrated into billing page. Helps reduce churn with targeted offers. 5 Pest tests with 6 assertions.

- **2026-03-22**: Task 164 (Enhanced Billing History): Created `/billing/history` page with complete invoice history. Features date filtering (30/90/365 days), search functionality, stats cards (total invoices, filtered amount, last invoice). Clean responsive list view with PDF download. "View History" link from billing page. 5 Pest tests with 46 assertions.

- **2026-03-22**: Task 163 (Plan Comparison Table): Created `/billing/compare` page with side-by-side plan comparison showing all features, limits, and pricing. Added monthly/yearly toggle with 20% savings indicator. Highlights current plan with comparison matrix. FAQ section included. "Compare Plans" button added to billing page. 6 Pest tests with 61 assertions.

- **2026-03-22**: Task 162 (Settings Menu Navigation): Fixed user menu dropdown with clear separation between Workspace Settings and Profile Settings. Removed redundant menu items. Ensured all menu items have proper icons. Updated seeder to add test users as admins to "Startup Hub" workspace.

- **2026-03-22**: Task 161 (Workspace Settings Menu Enhancement): Added "Workspace Settings" link to main sidebar (app-sidebar.tsx) for quick access. Improved workspace settings layout organization with consistent icons for all menu items.

- **2026-03-22**: Task 160 (Profile Settings Reorganization): Reorganized profile settings from 11 flat items into 4 logical sections (Profile: General + Connected Accounts; Security: Authentication + Sessions + Login History; Privacy: Cookies + Notifications + API Tokens; Support: Tickets). Merged Password + 2FA into combined "Authentication" page at `/settings/security/authentication`. Moved Appearance (theme toggle) into General/Profile page. Renamed "Privacy & Cookies" to "Cookies". Moved Security Summary and Session Summary cards to Authentication page. Added redirects for backward compatibility.

- **2026-03-22**: Fixed Help Center Page: Created `/help` page component with search bar, help categories (Getting Started, Account & Billing, Support Tickets, API Documentation), quick links, and contact support CTA; added route `GET /help` in web.php; page linked from sidebar footer.

- **2026-03-22**: Fixed Support Tickets Page Layout: Added proper `title` and `description` props to SettingsLayout; removed duplicate heading (layout now handles it); added CTA button in empty state; improved empty state icon (MessageSquare) and description; all 10 ticket tests pass.

- **2026-03-22**: Fixed Privacy Settings Page: Added missing route `GET /settings/privacy` in `routes/settings.php` that was referenced in the navigation menu but returned 404.

- **2026-03-22**: Improved Settings Menu: Reorganized into 5 logical sections (Workspace, Team, Analytics, Security, Account); added consistent icons to ALL menu items (Building2, CreditCard, Users, FileUp, BarChart3, TrendingUp, Activity, History, Shield, Webhook, AlertTriangle); renamed "Team" to "Members" and "Activity" to "Activity Log" for clarity; all items now have icons - no more empty icon slots.

- **2026-03-22**: Fixed Billing Page: Added null check before `Object.entries(usage)` on line 373 to prevent TypeError when usage data is deferred/undefined; all 46 billing tests pass.

- **2026-03-22**: Fixed Product Tour: Tour now waits for DOM to be ready before checking targets; added fallback to centered modal when targets not found; improved retry logic with 10 attempts; added close button and better error handling.

- **2026-03-22**: Improved onboarding wizard step 3 (Plan Selection): Replaced ugly dropdown with beautiful plan cards showing pricing, features, and limits; added billing period toggle (monthly/yearly) with savings badge; visual plan selection with clear CTAs; responsive 3-column layout with popular plan highlighting.

- **2026-03-22**: Task 159 (Session Activity Summary): Created `SessionSummaryController` returning session summary JSON with device/browser/platform parsing; built `SessionSummaryCard` React component showing current session, other sessions count, last activity info; integrated with existing session revocation endpoints; 8 Pest tests with 24 assertions; documentation at `/docs/features/session-summary.md`.

- **2026-03-22**: Task 158 (User Login Methods Summary): Created `SecuritySummaryController` with authentication methods aggregation and security score calculation; built `SecuritySummaryCard` React component with password/2FA/social account indicators, color-coded progress bar, and contextual recommendations; added `ConnectedAccountFactory` for testing; 12 Pest tests with 48 assertions; documentation at `/docs/features/security-summary.md`.

- **2026-03-22**: Task 157 (User Last Seen Timestamp): Verified existing implementation - `TrackLastSeen` middleware with 5-minute throttle, `last_seen_at` column on users, displayed in admin user list and team member pages; fixed Pest tests to include workspace context, all 6 tests passing. Created `/docs/features/user-last-seen.md` documentation.

- **2026-03-13**: Task 117 (Full Notification History Page): added `?filter=unread` support to notifications page (backend query + Inertia prop), `unreadCount` shared prop, `DELETE /api/notifications/{id}` to remove a single notification, `DELETE /api/notifications/read` to bulk-clear all read notifications; updated notifications page with All/Unread filter tabs, per-notification delete button, and "Clear read" action. *(6 new tests, 58 assertions total)*

- **2026-03-13**: Task 116 (Announcement Scheduling): enhanced `AnnouncementController::index()` with computed `status` field (`live`/`scheduled`/`expired`/`inactive`) per announcement and `?status` filter query param, updated announcements admin page with status filter tabs and colour-coded status badges (Live/Scheduled/Expired/Inactive) replacing the binary Active/Inactive badge. *(7 new tests, 77 assertions total)*

- **2026-03-13**: Task 115 (Workspace Plan Usage Alerts): added `PlanUsageLimitNotification` (mail + database with billing-category/channel-preference guard), `app:send-plan-usage-alerts` Artisan command computing team_members/api_keys/webhooks usage % per workspace against `PlanLimitService` limits, notifying owners when any dimension ≥80%, scheduled daily at 10:00 UTC with `--dry-run` support. *(9 tests, 16 assertions)*

- **2026-03-13**: Task 114 (Audit Log CSV Export): added `export()` action on `AuditLogController` streaming chunked CSV with current filter params applied, Export CSV button on the admin audit-logs page, route at `GET /admin/audit-logs/export`. *(3 tests, 5 assertions)*

- **2026-03-13**: Task 113 (Webhook Log Redelivery): added `retry()` action on `WebhookLogController` re-dispatching `WebhookCall` with original URL/payload/secret, Retry button with spinner on webhook logs page, route at `POST /workspaces/{workspace}/webhooks/logs/{webhookLog}/retry`. *(4 tests, 8 assertions)*

- **2026-03-12**: Task 112 (In-App Product Tour): added `tour_completed_at` timestamp column on users, `TourController::complete()` at `POST /tour/complete`, `use-tour.ts` hook with 4 steps (Dashboard → Team → Billing → Settings), `ProductTour` + `TourTooltip` components with backdrop/highlight ring/progress dots/Next+Skip+Done, mounted on dashboard for users without `tour_completed_at`. *(3 tests, 4 assertions)*

- **2026-03-12**: Task 111 (Public Status Page): added `StatusIncident` model with `scopeRecent()`/`isActive()`/`isResolved()`, public `/status` page with overall status banner (operational/degraded/outage/maintenance), admin CRUD at `/admin/status` with inline create/edit form and auto-resolve logic, admin nav entry, 3 seeded sample incidents. *(17 tests, 114 assertions)*

- **2026-03-12**: Task 110 (Admin Cohort Retention Analysis): added `CohortAnalysisController` with 6-month cohort table (3 retention months per cohort, colour-coded cells, average row), React triangular table page, route and admin nav entry. *(5 tests, 72 assertions)*

- **2026-03-12**: Task 109 (Weekly Workspace Activity Digest): added `WeeklyWorkspaceDigestNotification` (mail + database with team-category/channel-preference guard), `app:send-weekly-digests` Artisan command computing member delta, activity count, and 3 most recent events per workspace, scheduled Monday 08:00 UTC. *(7 tests, 14 assertions)*

- **2026-03-12**: Task 108 (Workspace Email Domain Restriction): added `allowed_email_domains` JSON column to workspaces, `isEmailDomainAllowed()` helper on Workspace model, domain enforcement in InvitationService and WorkspaceInviteLinkController, domain restriction card in workspace security settings UI, Acme Corporation demo workspace seeded with `acme.com` / `acmecorp.com` domains. *(11 tests, 18 assertions)*

- **2026-03-07**: Task 107 (Team Invite-Link Capacity UX Sync): disabled Team invite-link creation action when `canInvite` is false so customers get immediate UI feedback at capacity, and added feature coverage validating `canInvite=false` at seat limit. *(1 test, 1 assertion)*

- **2026-03-07**: Task 106 (Invite Link Creation Seat Guard): added seat-limit enforcement to invite-link creation flow, returning an upgrade/error message when limits are reached, and added feature coverage confirming no invite-link record is created at limit. *(1 test, 2 assertions)*

- **2026-03-07**: Task 105 (Non-Member Role Update Guard): added backend membership existence guard to team role update flow, returning `404` for non-member targets, and added feature coverage for non-member role-update denial. *(1 test, 1 assertion)*

- **2026-03-07**: Task 104 (Admin Granular Permission Lock): added backend guard to reject granular permission updates for admin-role users (matching Team UI constraints), and added feature coverage confirming admin permission payloads are rejected and persisted permissions remain unchanged. *(1 test, 2 assertions)*

- **2026-03-07**: Task 103 (Self Permission-Edit Protection): added backend guard to reject self-targeted granular permission updates in team management flow and added feature coverage confirming self updates are blocked and stored permissions remain unchanged. *(1 test, 2 assertions)*

- **2026-03-07**: Task 102 (Self Role-Change Protection): added backend guard in team role update flow to block self role changes even via direct requests, and added feature coverage confirming self-role mutation is rejected and original role is preserved. *(1 test, 2 assertions)*

- **2026-03-07**: Task 101 (Invite Link Seat-Limit Enforcement): enforced team member limit checks during invite-link join flow, returning users to join page with an error when workspace limits are reached, and added feature coverage to confirm blocked join and unchanged link usage counters. *(1 test, 2 assertions)*

- **2026-03-07**: Task 100 (Team Permission Input Guardrails): added server-side whitelist validation for team granular permissions (`manage_team`, `manage_billing`, `manage_webhooks`, `view_activity_logs`) in permission update flow and added feature tests for successful updates and invalid-permission rejection. *(2 tests, 4 assertions)*

- **2026-03-07**: Task 99 (Team Role Action Parity & Viewer Flow Coverage): fixed Team member role action menu to use explicit transitions (`admin`, `member`, `viewer`) instead of a misleading toggle path, added role-transition coverage for owner/admin viewer flows, and added invite-link viewer-role creation coverage. *(4 tests, 20 assertions)*

- **2026-03-07**: Task 95 (Admin Dashboard Analytics Widgets Recovery): validated existing dashboard analytics implementation (`MRR`, `churn_rate`, growth charts, plan distribution) through focused admin dashboard feature tests and confirmed data contract integrity. *(3 tests, 29 assertions)*

- **2026-03-07**: Tasks 96–98 recovery pass: restored admin 2FA wall route and middleware enforcement (`admin.2fa-required` + `RequireAdminTwoFactor` group), re-enabled impersonation log route (`admin.impersonation-logs.index`), restored broadcast routes (`admin.broadcasts.index/store`), restored admin navigation entries for impersonation logs and broadcasts, and re-enabled viewer role compatibility in team invite/role-update flows; validated with focused regressions and full suite (`998 passed`).

- **2026-03-07**: Task 94 (Global Support Ticket System Recovery): restored admin ticket routes (`index/show/update/reply`), re-added support ticket navigation in admin and settings layouts, regenerated Wayfinder routes/actions, and validated end-to-end support ticket flows with focused Pest coverage. *(10 tests, 59 assertions)*

- **2026-03-07**: Task 93 (Localization Management UI Recovery): restored admin translation routes and admin navigation entry for Translations, regenerated Wayfinder routes/actions, and validated localization flows with focused Pest coverage. *(7 tests, 39 assertions)*

- **2026-03-07**: Task 92 (User API Key Management UI): added admin routes/controller/page for per-user API token listing, issuance, and revocation, linked access from admin users table actions, regenerated Wayfinder routes/actions, and validated both admin and settings token flows with focused Pest coverage. *(11 tests, 53 assertions)*

- **2026-03-07**: Task 91 (Admin Application Log Viewer): wired admin log routes (`index/show/download/destroy`), restored System Logs navigation in admin layout, regenerated Wayfinder routes/actions, and validated log-viewer access/security/file-management behavior with focused Pest coverage. *(12 tests, 65 assertions)*

- **2026-03-07**: Task 90 (User Session Management for Admins): wired admin session routes, added “Manage Sessions” action in admin users table, enabled per-user active session listing and revoke/revoke-all flows from admin panel, regenerated Wayfinder routes/actions, and added admin session authorization/termination coverage. *(15 tests, 41 assertions)*

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
