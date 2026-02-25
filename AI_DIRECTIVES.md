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

## Next High-Priority SaaS Features (Agent's Decision)

As of Sprint 2, the agent has prioritized the following:

1. **Subscription & Billing Management UI:** Front-end interface for users to select pricing tiers, subscribe via Stripe Cashier, and view past invoices.
2. **Granular Roles & Permissions:** Expanding beyond simple 'is_superadmin' to workspace-level roles using policies.
3. **Onboarding Wizard:** Ensuring when a user signs up, they are directed to a seamless flow to create their first workspace and pick a plan.
4. **Real-time Notifications:** In-app dropdown for system and workspace alerts.
