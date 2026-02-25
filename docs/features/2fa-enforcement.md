# Two-Factor Authentication Enforcement

Workspace owners can require all members to have two-factor authentication (2FA) enabled before accessing the workspace. Members who haven't set up 2FA are redirected to a dedicated enforcement wall.

## How It Works

1. A workspace owner enables the "Require 2FA" toggle on the **Workspace Security** settings page
2. The `RequireTwoFactor` middleware checks every authenticated request
3. If the workspace requires 2FA and the member hasn't enabled it, they are redirected to `/workspace/2fa-required`
4. The enforcement wall page guides them to set up 2FA via Fortify
5. Once 2FA is enabled, the member regains full access automatically

## Database

A `require_two_factor` boolean column (default: `false`) is added to the `workspaces` table.

## Key Files

| File | Role |
|------|------|
| `database/migrations/2026_02_25_165531_add_require_two_factor_to_workspaces_table.php` | Migration |
| `app/Http/Middleware/RequireTwoFactor.php` | Enforcement middleware |
| `app/Http/Controllers/Settings/WorkspaceSecurityController.php` | Settings + wall controller |
| `resources/js/pages/settings/workspace-security.tsx` | Security settings page |
| `resources/js/pages/workspace-2fa-required.tsx` | Enforcement wall page |

## Middleware Logic

`RequireTwoFactor` is applied to the main `['auth', 'verified', 'onboarded', 'workspace', 'require2fa']` route group.

It allows through:

- Unauthenticated requests (let auth middleware handle it)
- Workspaces that don't require 2FA
- Fortify's own 2FA setup routes (`/user/two-factor-*`)
- The enforcement wall route itself (`workspace.2fa-required`) to avoid infinite redirects
- Logout route

Uses `$user->hasEnabledTwoFactorAuthentication()` from Fortify's `TwoFactorAuthenticatable` trait.

## Settings Page (`/settings/workspace-security`)

Only the workspace **owner** can toggle the setting (non-owners receive a `403`). The page shows:

- A toggle switch with an immediate amber warning when enabling
- Success flash message on save

## Enforcement Wall (`/workspace/2fa-required`)

A minimal full-page layout (no app shell) with:

- ShieldAlert icon, clear instruction steps
- "Enable Two-Factor Authentication" → links to `/user/two-factor-authentication` (Fortify)
- "Sign out" button

## Tests

```bash
php artisan test --compact tests/Feature/Settings/WorkspaceSecurityTest.php
```

| Test | Coverage |
|------|----------|
| Owner views security settings | 200 + Inertia component |
| Owner enables 2FA enforcement | DB updated, session success |
| Owner disables 2FA enforcement | DB updated, session success |
| Non-owner blocked from changing setting | 403 |
| Member without 2FA redirected when enforcement on | Redirect to enforcement wall |
| Member with 2FA passes through when enforcement on | 200 |
| Member without 2FA allowed when enforcement is off | 200 |
