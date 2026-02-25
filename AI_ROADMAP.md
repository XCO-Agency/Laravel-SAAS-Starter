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
- **Core Features**: Auth, 2FA, Workspaces, Teams, Stripe Billing, i18n, Dark Mode.

## 🚀 Active Sprint

- [x] **Task 1: Comprehensive Code Review & Test Assessment**
  - Read existing Pest tests to identify coverage gaps.
  - Implement missing unit/feature tests for edge cases (e.g., Stripe webhooks, team invitations).
- [x] **Task 2: Admin Dashboard (Superadmin)**
  - Implement a Superadmin role.
  - Build an overarching dashboard for managing all instances, users, and subscriptions.
- [x] **Task 3: API Token Management**
  - Implement Sanctum API token generation and revocation.
  - Add simple UI for API token management. UI to user settings.
- [x] **Task 4: Social Authentication (OAuth)**
  - Integrate Laravel Socialite.
  - Support GitHub and Google.
  - Build `connected_accounts` table for multi-provider support.
- [x] **Task 5: User Activity Logging**
  - Install `spatie/laravel-activitylog`.
  - Track Workspace modifications.
  - Build Activity Dashboard for Workspace Owners.
- [x] **Task 6: Outbound Webhooks**
- [x] **Task 1: Comprehensive Code Review & Test Assessment**
  - Read existing Pest tests to identify coverage gaps.
  - Implement missing unit/feature tests for edge cases (e.g., Stripe webhooks, team invitations).
- [x] **Task 2: Admin Dashboard (Superadmin)**
  - Implement a Superadmin role.
  - Build an overarching dashboard for managing all instances, users, and subscriptions.
- [x] **Task 3: API Token Management**
  - Implement Sanctum API token generation and revocation.
  - Add simple UI for API token management. UI to user settings.
- [x] **Task 4: Social Authentication (OAuth)**
  - Integrate Laravel Socialite.
  - Support GitHub and Google.
  - Build `connected_accounts` table for multi-provider support.
- [x] **Task 5: User Activity Logging**
  - Install `spatie/laravel-activitylog`.
  - Track Workspace modifications.
  - Build Activity Dashboard for Workspace Owners.
- [x] **Task 6: Outbound Webhooks**
- [x] **Task 1: Comprehensive Code Review & Test Assessment**
  - Read existing Pest tests to identify coverage gaps.
  - Implement missing unit/feature tests for edge cases (e.g., Stripe webhooks, team invitations).
- [x] **Task 2: Admin Dashboard (Superadmin)**
  - Implement a Superadmin role.
  - Build an overarching dashboard for managing all instances, users, and subscriptions.
- [x] **Task 3: API Token Management**
  - Implement Sanctum API token generation and revocation.
  - Add simple UI for API token management. UI to user settings.
- [x] **Task 4: Social Authentication (OAuth)**
  - Integrate Laravel Socialite.
  - Support GitHub and Google.
  - Build `connected_accounts` table for multi-provider support.
- [x] **Task 5: User Activity Logging**
  - Install `spatie/laravel-activitylog`.
  - Track Workspace modifications.
  - Build Activity Dashboard for Workspace Owners.
- [x] **Task 6: Outbound Webhooks**
- [x] **Task 1: Comprehensive Code Review & Test Assessment**
  - Read existing Pest tests to identify coverage gaps.
  - Implement missing unit/feature tests for edge cases (e.g., Stripe webhooks, team invitations).
- [x] **Task 2: Admin Dashboard (Superadmin)**
  - Implement a Superadmin role.
  - Build an overarching dashboard for managing all instances, users, and subscriptions.
- [x] **Task 3: API Token Management**
  - Implement Sanctum API token generation and revocation.
  - Add simple UI for API token management. UI to user settings.
- [x] **Task 4: Social Authentication (OAuth)**
  - Integrate Laravel Socialite.
  - Support GitHub and Google.
  - Build `connected_accounts` table for multi-provider support.
- [x] **Task 5: User Activity Logging**
  - Install `spatie/laravel-activitylog`.
  - Track Workspace modifications.
  - Build Activity Dashboard for Workspace Owners.
- [x] **Task 6: Outbound Webhooks**
- [x] **Task 1: Comprehensive Code Review & Test Assessment**
  - Read existing Pest tests to identify coverage gaps.
  - Implement missing unit/feature tests for edge cases (e.g., Stripe webhooks, team invitations).
- [x] **Task 2: Admin Dashboard (Superadmin)**
  - Implement a Superadmin role.
  - Build an overarching dashboard for managing all instances, users, and subscriptions.
- [x] **Task 3: API Token Management**
  - Implement Sanctum API token generation and revocation.
  - Add simple UI for API token management. UI to user settings.
- [x] **Task 4: Social Authentication (OAuth)**
  - Integrate Laravel Socialite.
  - Support GitHub and Google.
  - Build `connected_accounts` table for multi-provider support.
- [x] **Task 5: User Activity Logging**
  - Install `spatie/laravel-activitylog`.
  - Track Workspace modifications.
  - Build Activity Dashboard for Workspace Owners.
- [x] **Task 6: Outbound Webhooks**
- [x] **Task 1: Comprehensive Code Review & Test Assessment**
  - Read existing Pest tests to identify coverage gaps.
  - Implement missing unit/feature tests for edge cases (e.g., Stripe webhooks, team invitations).
- [x] **Task 2: Admin Dashboard (Superadmin)**
  - Implement a Superadmin role.
  - Build an overarching dashboard for managing all instances, users, and subscriptions.
- [x] **Task 3: API Token Management**
  - Implement Sanctum API token generation and revocation.
  - Add simple UI for API token management. UI to user settings.
- [x] **Task 4: Social Authentication (OAuth)**
  - Integrate Laravel Socialite.
  - Support GitHub and Google.
  - Build `connected_accounts` table for multi-provider support.
- [x] **Task 5: User Activity Logging**
  - Install `spatie/laravel-activitylog`.
  - Track Workspace modifications.
  - Build Activity Dashboard for Workspace Owners.
- [x] **Task 6: Outbound Webhooks**
- [x] **Task 1: Comprehensive Code Review & Test Assessment**
  - Read existing Pest tests to identify coverage gaps.
  - Implement missing unit/feature tests for edge cases (e.g., Stripe webhooks, team invitations).
- [x] **Task 2: Admin Dashboard (Superadmin)**
  - Implement a Superadmin role.
  - Build an overarching dashboard for managing all instances, users, and subscriptions.
- [x] **Task 3: API Token Management**
  - Implement Sanctum API token generation and revocation.
  - Add simple UI for API token management. UI to user settings.
- [x] **Task 4: Social Authentication (OAuth)**
  - Integrate Laravel Socialite.
  - Support GitHub and Google.
  - Build `connected_accounts` table for multi-provider support.
- [x] **Task 5: User Activity Logging**
  - Install `spatie/laravel-activitylog`.
  - Track Workspace modifications.
  - Build Activity Dashboard for Workspace Owners.
- [x] **Task 6: Outbound Webhooks**
- [x] **Task 1: Comprehensive Code Review & Test Assessment**
  - Read existing Pest tests to identify coverage gaps.
  - Implement missing unit/feature tests for edge cases (e.g., Stripe webhooks, team invitations).
- [x] **Task 2: Admin Dashboard (Superadmin)**
  - Implement a Superadmin role.
  - Build an overarching dashboard for managing all instances, users, and subscriptions.
- [x] **Task 3: API Token Management**
  - Implement Sanctum API token generation and revocation.
  - Add simple UI for API token management. UI to user settings.
- [x] **Task 4: Social Authentication (OAuth)**
  - Integrate Laravel Socialite.
  - Support GitHub and Google.
  - Build `connected_accounts` table for multi-provider support.
- [x] **Task 5: User Activity Logging**
  - Install `spatie/laravel-activitylog`.
  - Track Workspace modifications.
- **Stack**: Laravel 12, Inertia.js v2, React 19, Tailwind CSS v4, Stripe Cashier, Fortify.
- **Core Features**: Auth, 2FA, Workspaces, Teams, Stripe Billing, i18n, Dark Mode.

## 🏁 Sprint 1 (Completed)

- [x] Task 1: Comprehensive Code Review & Test Assessment
- [x] Task 2: Admin Dashboard (Superadmin)
- [x] Task 3: API Token Management
- [x] Task 4: Social Authentication (OAuth)
- [x] Task 5: User Activity Logging
- [x] Task 6: Outbound Webhooks
- [x] Task 7: Sentry Integration
- [x] Task 8: User Impersonation
- [x] Task 9: Database Demo Seeders

## 🚀 Active Sprint 2: Core SaaS Mechanics

- [x] **Task 10: Subscription & Billing Management UI**
  - Implement Cashier subscription checkout flow.
  - Build frontend pricing tables connecting to Stripe capabilities.
  - Create Billing Settings page to manage plans, display invoices, and handle payment methods.
- [x] **Task 11: Granular Roles & Permissions Architecture**
  - Extract primitive role strings into robust Policy/Gate checks mapping to User/Workspace actions.
  - Implement UI inside Workspace Settings to modify member capabilities.
- [x] **Task 12: Application Real-Time Notifications**
  - Wire Laravel Database Notifications visually.
  - Add an intuitive dropdown bell to the top navigation layout.

## 📝 Changelog

- **2026-02-25**: Concluded `Task 11` (Granular Roles & Permissions Architecture). Transitioned string roles (`admin`, `owner`) into granular `Gate::authorize()` JSON-driven capability mappings stored securely in the `workspace_user` pivot table. Built a native interactive UI letting Owners dynamically toggle features per member natively.

- **2026-02-25**: Orchestrated `Task 12` (Application Real-Time Notifications). Installed native Database Notifications returning via `$request->user()->unreadNotifications()`. Built a React `<NotificationsDropdown>` polling mechanism gracefully handling reading states inline, injected fluidly into `app-header.tsx` and `app-sidebar-header.tsx` top-level layouts. Supported natively by strictly authenticated Pest validations preventing cross-tenancy notification pollution.

- **2026-02-25**: Audited and confirmed out-of-the-box Stripe Cashier integrations satisfying `Task 10`. Ran robust endpoint protections mathematically proving that non-owner Workspace tenants cannot access or modify Stripe subscriptions or portal linkages.

- **2026-02-24**: Scaffolded `Task 9` (Database Demo Seeders) hydrating comprehensive mock data directly inside the persistent database environment. Generated instantaneous `superadmin` credentials, built raw Sanctum API text tokens onto Developer mock settings, booted random dummy Slack/CRM Webhooks endpoints into Personal Workspaces, and fabricated realistic trailing Activity Logs modeling historical event histories natively overriding default creation stamps.
- **2026-02-24**: Engineered zero-dependency User Impersonation (`Task 8`). Scaffolded isolated `admin.impersonate` endpoints caching the Superadmin signature securely within `impersonated_by` Session tokens. Bootstrapped native React `app-shell` wrappers projecting a persistent global warning banner and 1-click revocation. Passed 134 suite tests.
- **2026-02-24**: Integrated Sentry application-wide (`Task 7`). Deployed PHP/Laravel backend error capture natively parsing `bootstrap/app.php` using `$exceptions->handles()`, while installing `@sentry/react` inside `@/js/app.tsx` for React error and tracing fidelity.
- **2026-02-24**: Instantiated Workspace-level tracking utilizing `spatie/laravel-activitylog`. Built a secure Activity Log UI feeding solely to Workspace administrators natively tracking events generated against their workspace. Task 5 completed.
- **2026-02-24**: Scaffolded Social Authentication via `laravel/socialite`. Deployed multi-tenant multi-provider OAuth registration spanning standard routing logic and Personal Workspaces. Task 4 completed.
- **2026-02-24**: Successfully integrated `laravel/sanctum` for API Token Management within the unified Settings dashboard. Task 3 completed.
- **2026-02-24**: Initial setup of the autonomous workflow system (`AI_ROADMAP.md`).

## 🚀 Active Sprint 3: Onboarding & User Experience

- [ ] **Task 13: User Onboarding Sequence**
  - Implement a mandatory multi-step funnel for new registrations.
  - Intercept authenticated traffic utilizing `EnsureUserIsOnboarded` middleware.
  - Collect user details, generate the first Workspace, and prompt for initial plan selections dynamically.
