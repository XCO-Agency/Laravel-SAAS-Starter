# AI Agent Directives & Memory

> **CRITICAL:** This file contains immutable user instructions and feedback. Read this file to understand the operational context of this project.

## Operational Autonomy

1. **Full Autonomy Granted:** The AI agent is the primary manager of this project.
2. **Zero-Permission Execution:** DO NOT ask the user "what should we do next?" or "do you approve this feature?". The agent MUST decide the roadmap, prioritize features, and execute them autonomously.
3. **Continuous Flow:** After finishing a task, immediately select the next logical feature for a SaaS starter kit and begin implementation. Only stop to notify the user if hard blocked by an external requirement (like providing a secret API key that cannot be mocked).
4. **Agent Orchestration:** The agent is authorized to create as many sub-agents, tasks, and matrix files as necessary to achieve the goals of a premium Laravel SAAS Starter kit.

## Learned Feedback & Constraints

1. **Don't Ask Redundant Questions:** Never ask for permission to proceed to the next feature. Just outline what you are building and build it.
2. **Tech Stack Consistency:**
   - Backend: Laravel 12, standard PHP 8.4 typing, Pest for all testing.
   - Frontend: Inertia v2 (+ React 19), Tailwind CSS v4.
   - Database: Always write raw SQLite-compatible migrations unless absolutely necessary.
   - Integrations: Stripe (Cashier), Sentry, Socialite.
3. **Pest Testing:** Every feature MUST be backed by Pest feature/unit tests. Run the test suite (`php artisan test --compact`) constantly.
4. **Wayfinder/Types:** Ensure all endpoints are mapped and TypeScript types (`index.d.ts`) reflect backend structures exactly to prevent React typing errors.
5. **Demo Data Hydration:** ALWAYS update the `DatabaseSeeder.php` after finalizing a new feature schema to ensure the local demo data environment is fully populated and demonstrates the capabilities just added.
6. **Documentation Requirements:** Whenever you build a new feature, you MUST create a comprehensive markdown documentation file for it in the `/docs/features/` directory and update `docs/README.md` to index it.

7. **Feature Focus:** Prioritize customer-facing features (Productivity tools, Billing, Settings, Onboarding) over administrative internals. Only implement "must-have" admin features (Audit logs, basic management) to maintain operational visibility.

## Completed SaaS Features

As of Sprint 40, the following major features have been implemented:

1. **Subscription & Billing Management UI** - Stripe Cashier integration with plan comparison, billing history, cancellation flow, seat-based billing, and usage dashboard.
2. **Granular Roles & Permissions** - Workspace-level roles (Owner, Admin, Member, Viewer) with fine-grained permission management and preset templates.
3. **Onboarding Wizard** - Multi-step onboarding flow with checklist, product tour, and completion insights.
4. **Real-time Notifications** - Laravel Reverb WebSocket broadcasting with notification preferences and delivery analytics.
5. **Team Management** - Invitations, invite links, CSV import, bulk actions, member activity reports.
6. **Admin Panel** - 28+ admin features including impersonation, audit logs, system health, maintenance mode, cohort analysis, revenue analytics.
7. **Workspace Features** - Comments, announcements, templates, tags, custom fields, branding, trash/restore, suspension.
8. **API & Webhooks** - Workspace API keys, webhook endpoints with delivery logs, API usage dashboard.
9. **Security** - 2FA enforcement, login activity logging, password history, session management, IP allowlisting.
10. **Data & Privacy** - GDPR data export, data retention policies, account deletion.

## Next Priority Areas

- Frontend component test coverage (Jest/Vitest)
- Performance optimization and load testing
- AI agent integration features
- Advanced analytics and reporting
