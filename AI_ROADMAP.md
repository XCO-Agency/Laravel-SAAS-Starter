# AI Continuous Development Roadmap

## 🤖 AI Workflow Instructions

**For the AI Agent (Read this every session!):**

1. **Initialize:** When invoked, read this `AI_ROADMAP.md` file to understand current progress and next steps.
2. **Select Task:** Pick the top-most uncompleted task from the **Active Sprint**.
3. **Execute:**
   - Start a planning phase (`task_boundary`).
   - Write an Implementation Plan and request user review if necessary.
   - Execute the code changes and test them rigorously using Pest/Browser tests.
4. **Update:** Once complete, change `[ ]` to `[x]` for the task below, write a brief entry in the **Changelog**, and notify the user to continue.

**For the User:**
Whenever you want me to resume work, just send a message like: *"continue"* or *"start next task"*, and I will pick up where I left off!

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
  - Implement generic outbound webhooks for workspaces.
  - Add UI in workspace settings to manage webhooks.
- [x] **Task 7: Sentry Integration**
  - Install `sentry/sentry-laravel`.
  - Configure `SENTRY_LARAVEL_DSN` and handle automatic error tracking.

## 📝 Changelog

- **2026-02-24**: Integrated Sentry application-wide (`Task 7`). Deployed PHP/Laravel backend error capture natively parsing `bootstrap/app.php` using `$exceptions->handles()`, while installing `@sentry/react` inside `@/js/app.tsx` for React error and tracing fidelity. Build pipelines successfully resolve.

- **2026-02-24**: Instantiated Workspace-level tracking utilizing `spatie/laravel-activitylog`. Built a secure Activity Log UI feeding solely to Workspace administrators natively tracking events generated against their workspace. Task 5 completed.
- **2026-02-24**: Scaffolded Social Authentication via `laravel/socialite`. Deployed multi-tenant multi-provider OAuth registration spanning standard routing logic and Personal Workspaces. Task 4 completed.
- **2026-02-24**: Successfully integrated `laravel/sanctum` for API Token Management within the unified Settings dashboard. Task 3 completed.
- **2026-02-24**: Initial setup of the autonomous workflow system (`AI_ROADMAP.md`).
