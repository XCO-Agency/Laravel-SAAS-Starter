# Implementation Plan

## Sprint 26 — Task 107: Team Invite-Link Capacity UX Sync

### Goal
Provide immediate customer-facing feedback in Team UI when workspace capacity is reached by disabling invite-link creation affordances in lockstep with backend seat guards.

### Scope
- Disable invite-link create button when `canInvite` is false.
- Reuse existing `canInvite` prop contract from Team index payload.
- Add feature coverage for `canInvite` false at limit.

### Technical Steps
1. Update Team page invite-link trigger button to honor `canInvite`.
2. Add Team index feature test for seat-limit scenario (`canInvite=false`).
3. Keep backend guards from Task 106 unchanged.
4. Update roadmap/changelog/walkthrough/docs.

### Verification
- `php artisan test --compact tests/Feature/Team/TeamManagementTest.php`
- `vendor/bin/pint --dirty`

## Sprint 26 — Task 106: Invite Link Creation Seat Guard

### Goal
Prevent customers from generating invite links that cannot be used due to workspace seat limits.

### Scope
- Add member-limit check before invite-link creation.
- Reuse existing team seat-limit service logic.
- Add feature test for blocked creation at limit.

### Technical Steps
1. Add `canInvite` guard in `WorkspaceInviteLinkController@store`.
2. Return with existing upgrade-oriented error message when limits are reached.
3. Add feature test asserting blocked creation and missing link record.
4. Update roadmap/changelog/walkthrough/docs.

### Verification
- `php artisan test --compact tests/Feature/Team/InviteLinkTest.php`
- `vendor/bin/pint --dirty`

## Sprint 26 — Task 105: Non-Member Role Update Guard

### Goal
Prevent role-update endpoint misuse by rejecting requests that target users who are not members of the current workspace.

### Scope
- Add membership check in role-update endpoint.
- Return `404` when target user is outside workspace membership.
- Add focused feature coverage for non-member role-update attempts.

### Technical Steps
1. Add `hasUser` membership guard in `TeamController@updateRole`.
2. Keep existing self/owner protections and role validation intact.
3. Add feature test asserting `assertNotFound()` for non-member target updates.
4. Update roadmap/changelog/walkthrough/docs.

### Verification
- `php artisan test --compact tests/Feature/Team/TeamManagementTest.php`
- `vendor/bin/pint --dirty`

## Sprint 26 — Task 104: Admin Granular Permission Lock

### Goal
Align backend authorization behavior with Team UI by disallowing granular permission editing for admin-role users.

### Scope
- Add backend guard for admin targets in permission update endpoint.
- Preserve owner and self-target protection added in prior tasks.
- Add feature coverage for rejected admin permission edits.

### Technical Steps
1. Add admin-role guard in `TeamController@updatePermissions` before writing pivot permissions.
2. Return error flash on admin-target permission-edit attempts.
3. Add focused feature test that owner cannot assign granular permissions to admin members.
4. Update roadmap/changelog/walkthrough/docs.

### Verification
- `php artisan test --compact tests/Feature/Team/TeamManagementTest.php`
- `vendor/bin/pint --dirty`

## Sprint 26 — Task 103: Self Permission-Edit Protection

### Goal
Ensure team managers cannot alter their own granular permission set through direct endpoint requests.

### Scope
- Add backend self-target protection in permission update endpoint.
- Preserve existing permission whitelist and owner restrictions.
- Add feature coverage for rejected admin self-permission updates.

### Technical Steps
1. Add early-return guard in `TeamController@updatePermissions` when acting user matches target user.
2. Return with error flash and preserve stored permission state.
3. Add focused feature test for admin self-permission update rejection.
4. Update roadmap/changelog/walkthrough/docs.

### Verification
- `php artisan test --compact tests/Feature/Team/TeamManagementTest.php`
- `vendor/bin/pint --dirty`

## Sprint 26 — Task 102: Self Role-Change Protection

### Goal
Ensure team role-management endpoints cannot be used to change the acting user's own role, aligning backend behavior with the frontend safety UX.

### Scope
- Add backend guard for self role-change attempts.
- Preserve existing owner-role protections and role validation.
- Add feature test for admin self-role update rejection.

### Technical Steps
1. Add early-return guard in `TeamController@updateRole` when target user matches acting user.
2. Return with error flash while leaving current role unchanged.
3. Add a focused role-update feature test for admin self-change attempts.
4. Update roadmap/changelog/walkthrough and docs to capture behavior.

### Verification
- `php artisan test --compact tests/Feature/Team/TeamManagementTest.php`
- `vendor/bin/pint --dirty`

## Sprint 26 — Task 101: Invite Link Seat-Limit Enforcement

### Goal
Ensure invite-link joins cannot bypass workspace member limits enforced elsewhere in team invitation flows.

### Scope
- Add member-limit guard in invite-link join endpoint.
- Reuse existing invitation seat-limit service logic.
- Add feature coverage for blocked join behavior at limit.

### Technical Steps
1. Inject `InvitationService` into `WorkspaceInviteLinkController`.
2. Add guard in `join()` to deny join when `canInvite($workspace)` is false.
3. Redirect denied users back to join page with error message.
4. Add feature test asserting join denial and unchanged `uses_count`.

### Verification
- `php artisan test --compact tests/Feature/Team/InviteLinkTest.php`
- `vendor/bin/pint --dirty`

## Sprint 26 — Task 100: Team Permission Input Guardrails

### Goal
Prevent unsupported permission identifiers from being persisted through team permission update requests.

### Scope
- Add backend whitelist validation for granular permission IDs.
- Keep existing permission payload shape unchanged.
- Add feature coverage for accepted and rejected permission payloads.

### Technical Steps
1. Define allowed permission IDs in `TeamController@updatePermissions`.
2. Apply `Rule::in(...)` validation to `permissions.*`.
3. Add tests for valid permission updates and invalid permission rejection.
4. Update roadmap/changelog/walkthrough and related feature documentation.

### Verification
- `php artisan test --compact tests/Feature/Team/TeamManagementTest.php`
- `vendor/bin/pint --dirty`

## Sprint 26 — Task 99: Team Role Action Parity & Viewer Flow Coverage

### Goal
Eliminate ambiguous team role-change behavior in the Team UI and ensure backend role transitions involving `viewer` are explicitly verified.

### Scope
- Replace role-toggle action with explicit role transition actions in Team member dropdown.
- Preserve existing backend role endpoints and policy behavior.
- Add feature tests for owner/admin transitions that include `viewer`.
- Add invite-link test coverage for `viewer` role creation.

### Technical Steps
1. Replace toggle-based role update menu in `Team/index` with explicit action entries for `admin`, `member`, and `viewer` target roles.
2. Add role transition tests in `TeamManagementTest` covering member→viewer and viewer→member transitions.
3. Add `InviteLinkTest` case validating viewer-role invite-link generation.
4. Update roadmap/changelog and walkthrough entry for task completion.

### Verification
- `php artisan test --compact tests/Feature/Team/TeamManagementTest.php tests/Feature/Team/InviteLinkTest.php`
- `vendor/bin/pint --dirty`

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

## Sprint 25 — Tasks 96-98: Admin Security & Broadcast Recovery

### Goal
Restore previously available admin security and communication capabilities that regressed from route/middleware drift: admin 2FA enforcement, impersonation audit log viewing, and broadcast messaging management.

### Scope
- Reintroduce `admin.2fa-required` route and `RequireAdminTwoFactor` protection for admin area.
- Re-enable impersonation audit-log listing route for superadmins.
- Re-enable admin broadcast index/store routes.
- Restore admin nav discoverability for impersonation logs and broadcasts.
- Reconcile viewer-role support in team role management to avoid workspace role regressions.

### Technical Steps
1. Add admin enforcement wall route and wrap protected admin routes in `RequireAdminTwoFactor` middleware.
2. Add missing `impersonation-logs` and `broadcasts` admin routes.
3. Restore `Impersonation Logs` and `Broadcasts` entries in admin layout navigation.
4. Re-enable `viewer` role acceptance in `TeamController` validations and team role selectors.
5. Regenerate Wayfinder, format dirty files, and run targeted failing tests.
6. Run full compact test suite for end-to-end confirmation.

### Verification
- `php artisan wayfinder:generate --no-interaction`
- `vendor/bin/pint --dirty`
- `php artisan test --compact tests/Feature/AdminBroadcastTest.php tests/Feature/AdminTwoFactorTest.php tests/Feature/ImpersonationLogTest.php tests/Feature/WorkspaceRoleTest.php`
- `php artisan test --compact`

## Sprint 25 — Task 95: Admin Dashboard Analytics Widgets Recovery

### Goal
Confirm the advanced admin analytics dashboard widgets remain intact and correctly wired after route/security recoveries.

### Scope
- Validate server-provided analytics props for admin dashboard.
- Validate superadmin/standard-user/guest access expectations.
- Confirm chart/metric payload contract used by `admin/dashboard` frontend.

### Technical Steps
1. Inspect `Admin\DashboardController` metrics/chart payloads for expected fields.
2. Inspect `resources/js/pages/admin/dashboard.tsx` for widget rendering and contract parity.
3. Run focused admin dashboard feature tests.

### Verification
- `php artisan test --compact tests/Feature/Admin/DashboardTest.php`
