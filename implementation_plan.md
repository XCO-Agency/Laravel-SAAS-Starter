# Implementation Plan

## Sprint 21 — Task 75: Granular Team Permission Parity

### Goal
Align invite-link management with workspace capability-based authorization so users with explicit `manage_team` permission can manage invite links even when not admins.

### Scope
- Update invite-link create authorization path.
- Update invite-link revoke authorization path.
- Add feature tests for permission-granted members.
- Refresh documentation and roadmap metadata.
- Seed demo data showcasing granular capability assignment.

### Technical Steps
1. Replace role-only auth checks with `manageTeam` policy checks in invite-link flows.
2. Extend `InviteLinkTest` with permission-granted member scenarios.
3. Add feature documentation for granular roles/permissions and update docs index.
4. Update roadmap/changelog with Sprint 21 kickoff and Task 75 completion.
5. Run targeted Pest tests and formatting.

### Verification
- `php artisan test --compact tests/Feature/Team/InviteLinkTest.php`
- `vendor/bin/pint --dirty`

## Sprint 21 — Task 76: Permission Matrix UI Polish

### Goal
Improve clarity and scanability of granular capability assignment in team settings without changing permission identifiers or backend authorization semantics.

### Scope
- Group capability toggles by access domain.
- Improve permission labels and descriptions.
- Preserve existing permission IDs and form submission shape.

### Technical Steps
1. Replace flat permission list with grouped configuration.
2. Render group headers and grouped checkbox cards in the dialog.
3. Keep the same payload keys (`permissions`) and values (`manage_team`, etc.).

### Verification
- `npm run build`
- `php artisan test --compact tests/Feature/Team/InviteLinkTest.php`

## Sprint 21 — Task 77: Onboarding Billing Step

### Goal
Add an explicit optional billing step to onboarding so users can signal paid-plan intent immediately after workspace creation.

### Scope
- Add onboarding plan and billing period inputs.
- Redirect paid-intent users to billing plans with recommendation context.
- Surface recommendation state in billing plans UI.
- Add targeted tests for onboarding redirect and billing recommendation props.

### Technical Steps
1. Extend onboarding payload validation to include optional plan intent fields.
2. Add onboarding wizard third step for plan/billing selection.
3. Redirect paid-intent users to billing plans with query parameters.
4. Read and apply recommendation props in billing plans page.
5. Add feature tests and verify via backend tests + frontend build.

### Verification
- `php artisan test --compact tests/Feature/OnboardingTest.php tests/Feature/Billing/BillingTest.php`
- `npm run build`

## Sprint 21 — Task 78: Notification Channel Preferences

### Goal
Allow users to independently control email and in-app notification channels while keeping category-level controls and legacy preference compatibility.

### Scope
- Extend notification preferences schema to channels + categories.
- Update settings UI to expose channel toggles.
- Normalize legacy flat preferences in backend reads/writes.
- Apply channel/category checks to notification delivery behavior.

### Technical Steps
1. Add normalized notification preference helpers on `User`.
2. Update notification preferences controller to validate nested schema.
3. Update settings notifications page to channel + category toggles.
4. Update notification channel selection logic in `DataExportCompleted`.
5. Add feature + unit tests and update docs/roadmap.

### Verification
- `php artisan test --compact tests/Feature/Settings/NotificationPreferencesTest.php tests/Feature/Notifications/DataExportCompletedNotificationTest.php`
- `npm run build`

## Sprint 24 — Task 90: User Session Management for Admins

### Goal
Allow superadmins to inspect and terminate active sessions for any platform user directly from the admin panel.

### Scope
- Wire missing admin session management routes.
- Ensure admin users table exposes a direct "Manage Sessions" action.
- Reuse existing admin sessions Inertia page/controller path.
- Add/refresh feature tests for access control and termination actions.
- Regenerate Wayfinder routes/actions after route updates.

### Technical Steps
1. Register session listing and termination endpoints under admin users routes.
2. Add a dropdown action on the admin users page to navigate to per-user session management.
3. Keep session termination safety behavior in controller (never terminate acting admin's current request session).
4. Add deterministic Pest coverage for non-superadmin denial on termination endpoints.
5. Regenerate route helpers/types and run targeted tests.

### Verification
- `php artisan wayfinder:generate --no-interaction`
- `vendor/bin/pint --dirty`
- `php artisan test --compact tests/Feature/Admin/UserSessionTest.php tests/Feature/Admin/AdminUserTest.php`

## Sprint 24 — Task 91: Admin Application Log Viewer

### Goal
Expose secure superadmin access to application log files with browsing, inspection, download, and deletion capabilities from the admin panel.

### Scope
- Register missing admin routes for log viewer operations.
- Restore admin sidebar navigation entry for System Logs.
- Reuse existing `LogViewerController` + Inertia page implementation.
- Validate traversal protection and file operations with focused Pest tests.
- Regenerate Wayfinder after route updates.

### Technical Steps
1. Add admin routes for `logs.index`, `logs.show`, `logs.download`, and `logs.destroy`.
2. Apply `where('file', '.*')` constraints so traversal attempts reach controller guards.
3. Ensure route order keeps `/download` from being shadowed by wildcard show route.
4. Add `System Logs` to admin navigation for discoverability.
5. Run route generation, formatting, and targeted log-viewer tests.

### Verification
- `php artisan wayfinder:generate --no-interaction`
- `vendor/bin/pint --dirty`
- `php artisan test --compact tests/Feature/Admin/LogViewerTest.php tests/Feature/Admin/UserSessionTest.php`

## Sprint 24 — Task 92: User API Key Management UI

### Goal
Allow superadmins to manage personal API tokens for individual users from the admin panel for support and security operations.

### Scope
- Add admin routes for viewing, creating, and revoking user API tokens.
- Implement a dedicated admin page for per-user token management.
- Add a direct users-table action to navigate to token management.
- Enforce superadmin-only access via existing admin middleware.
- Cover functionality with focused Pest feature tests.

### Technical Steps
1. Add `admin.users.api-tokens.index/store/destroy` routes under the admin group.
2. Create `Admin\UserApiTokenController` with token list/create/revoke actions.
3. Create Inertia page `admin/user-api-tokens` for CRUD interactions.
4. Add “Manage API Tokens” action in `admin/users` row dropdown.
5. Regenerate Wayfinder and run targeted admin/settings token tests.

### Verification
- `php artisan wayfinder:generate --no-interaction`
- `vendor/bin/pint --dirty`
- `npm run build`
- `php artisan test --compact tests/Feature/Admin/UserApiTokenManagementTest.php tests/Feature/Settings/ApiTokenTest.php`

## Sprint 25 — Task 93: Localization Management UI Recovery

### Goal
Restore complete superadmin access to localization management by wiring existing translation routes and admin navigation back into the active application shell.

### Scope
- Re-enable admin translation routes (`index`, `show`, `store`, `update`).
- Add `Translations` entry in admin navigation for discoverability.
- Keep existing translation controller/page behavior unchanged.
- Regenerate Wayfinder routes/actions after route updates.
- Validate with focused Pest coverage for translation workflows.

### Technical Steps
1. Register translation routes in the admin superadmin route group.
2. Restore a sidebar/mobile admin navigation link to `/admin/translations`.
3. Regenerate route/action helpers to keep typed frontend route bindings in sync.
4. Run formatting on dirty files.
5. Execute translation feature tests.

### Verification
- `php artisan wayfinder:generate --no-interaction`
- `vendor/bin/pint --dirty`
- `php artisan test --compact tests/Feature/Admin/TranslationTest.php`

## Sprint 25 — Task 94: Global Support Ticket System Recovery

### Goal
Restore full support-ticket accessibility by reconnecting existing user/admin ticket flows through missing admin routes and navigation entrypoints.

### Scope
- Re-enable admin support-ticket routes for list/show/update/reply actions.
- Restore admin panel navigation link to ticket management.
- Restore user settings navigation link to personal support ticket portal.
- Keep existing ticket controllers/pages/models unchanged.
- Regenerate Wayfinder after route changes and validate via focused tests.

### Technical Steps
1. Add ticket routes in the admin superadmin route group.
2. Add `Support Tickets` in admin sidebar/mobile nav.
3. Add `Support Tickets` in account settings navigation.
4. Regenerate route/action helpers to keep frontend typing synchronized.
5. Run formatting and focused support-ticket feature tests.

### Verification
- `php artisan wayfinder:generate --no-interaction`
- `vendor/bin/pint --dirty`
- `php artisan test --compact tests/Feature/SupportTicketsTest.php`
