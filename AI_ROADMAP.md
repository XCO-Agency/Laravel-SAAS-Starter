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

## 📋 Backlog (Future Enhancements)

- [ ] Implement social authentication (OAuth) using Laravel Socialite (GitHub, Google, etc.).
- [ ] Add robust activity logging for user actions within workspaces.
- [ ] Implement generic outbound webhooks for workspaces.
- [ ] Integrate Sentry / Bugsnag for automated error reporting.

## 📝 Changelog

- **2026-02-24**: Successfully integrated `laravel/sanctum` for API Token Management within the unified Settings dashboard. Task 3 completed.
- **2026-02-24**: Built Superadmin Role, `EnsureSuperadmin` middleware, and the Admin Dashboard with full Pest testing coverage. Task 2 completed.

- **2026-02-24**: Added extensive testing for `LocaleController` and `StripeWebhookController`. Task 1 completed.
- **2026-02-24**: Initial setup of the autonomous workflow system (`AI_ROADMAP.md`).
