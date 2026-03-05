# Walkthrough Log

## 2026-03-05 — Sprint 21 / Task 75

Implemented granular permission parity for team invite-link management.

### Summary
- Switched invite-link creation authorization from role-only checks to policy capability (`manageTeam`).
- Switched invite-link revocation authorization from role-only checks to policy capability (`manageTeam`).
- Added tests proving members with explicit `manage_team` permission can create/revoke invite links.
- Updated demo seeding to grant one member per demo workspace `manage_team` for practical demonstration.
- Added and indexed dedicated documentation for granular roles/permissions.
- Updated roadmap to start Sprint 21 and mark Task 75 complete.

### Verification
- Targeted test suite run for invite links.
- Pint formatting check run.

## 2026-03-05 — Sprint 21 / Task 76

Implemented permission matrix UI polish in team settings.

### Summary
- Reworked the permissions dialog from a flat list to grouped capability sections:
	- Team Access
	- Billing Access
	- Operations Access
- Updated labels/descriptions to be more action-oriented and less ambiguous.
- Preserved existing permission identifiers and backend payload shape for full compatibility.

### Verification
- `npm run build`
- `php artisan test --compact tests/Feature/Team/InviteLinkTest.php`

## 2026-03-05 — Sprint 21 / Task 77

Implemented onboarding billing step and recommendation handoff.

### Summary
- Added a third onboarding step to capture optional plan + billing-period preference.
- Extended onboarding backend validation to accept billing preference fields.
- Redirect paid-intent users to billing plans with recommendation query params.
- Updated billing plans page to show onboarding context and preselect recommended billing period.
- Added test coverage for onboarding paid-intent redirect and billing recommendation prop mapping.

### Verification
- `php artisan test --compact tests/Feature/OnboardingTest.php tests/Feature/Billing/BillingTest.php`
- `npm run build`

## 2026-03-05 — Sprint 21 / Task 78

Implemented notification channel preferences with backward compatibility.

### Summary
- Added independent channel toggles for Email and In-app notifications in settings.
- Migrated preference handling to normalized `channels` + `categories` schema.
- Preserved compatibility with legacy flat preference payloads via normalization.
- Updated `DataExportCompleted` notification to honor category and channel preferences and support database delivery.
- Added feature and unit tests for preference persistence/normalization and channel selection.

### Verification
- `php artisan test --compact tests/Feature/Settings/NotificationPreferencesTest.php tests/Feature/Notifications/DataExportCompletedNotificationTest.php`
- `npm run build`
