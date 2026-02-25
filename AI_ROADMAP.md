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

## 🚀 Active Sprint 11: Application Polish & Engagement

- [x] **Task 29: Webhook Event Log UI** — Completed.
- [x] **Task 34: Email Template System** — Completed.
- [x] **Task 35: User Feedback Widget** — Floating in-app feedback button with Bug/Idea/General types. Admin review panel with status tabs, type filtering, and actions. 14 tests.

## 📋 Upcoming Sprint 12: Enterprise Mechanics

- [ ] **Task 36: SSO / SAML Authentication**
  - Enterprise SSO support for workspace-level identity providers.
- [x] **Task 37: Seat-Based Billing** — Workspace seat helpers, Stripe quantity sync on member removal, billing page seat meter with progress bar, 6 tests.
- [ ] **Task 38: Custom Domain per Workspace**
  - Allow workspaces to use their own subdomain or custom domain.
- [x] **Task 39: Data Retention Policies** — config-driven TTLs, daily `app:prune-old-records` command with `--dry-run`, admin UI with manual trigger, 6 tests.

## 🏁 Completed Sprints

- **Sprints 1-8**: Core SaaS Mechanics, Admin Dashboard, Webhooks, Sentry, Activity Logs, Settings, UI refinement.
- **Sprint 9**: Developer Experience & Integration (Feature Flags, Announcements, Command Palette).
- **Sprint 10**: Deep Review & Polish (Documentation generated: UI/Theming, Workspaces, I18N, Billing, Security; Landing Page enhanced).

## 📝 Changelog

- **2026-02-25**: Task 39 (Data Retention). Config-driven pruning, daily scheduler, admin trigger UI with dry-run.
- **2026-02-25**: Task 37 (Seat-Based Billing). Workspace seat helpers, Stripe quantity sync, seat meter on billing page.
- **2026-02-25**: Completed Sprint 11 (Tasks 29, 34, 35). Webhook delivery logs, database-driven email templates, in-app feedback widget with admin review panel.
- **2026-02-25**: Completed Sprint 10 (Tasks 31-33). Wrote extensive markdown documentation detailing architecture mapping to all physical features. Enhanced frontend landing page to showcase precise value capabilities.
- **2026-02-25**: Completed Sprint 9 (Tasks 28, 30). Built interactive Announcement banner arrays resolving natively via global middleware payload. Bootstrapped native Laravel Pennant integration pushing targeted rollout caches downstream linearly to Inertia.
- **2026-02-25**: Completed Task 14 (Command Palette). Replaced conventional user navigation with CMDK interactive abstractions.
