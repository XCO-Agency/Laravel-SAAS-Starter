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
