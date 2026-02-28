# Admin Impersonation

## Overview

Super administrators can impersonate any user to see the application exactly as that user would. A persistent banner is displayed during impersonation with a one-click button to stop and return to the admin account.

## Access

- **Impersonate:** `POST /admin/impersonate/{user}` (superadmin only)
- **Stop:** `POST /admin/impersonate/leave` (any authenticated user with active impersonation session)

## How It Works

1. **Start Impersonation:** The superadmin clicks "Impersonate" on any user in the admin users page. The system stores the original admin's ID in `session('impersonated_by')` and logs in as the target user.

2. **During Impersonation:** A sticky destructive-colored banner appears at the top of every page showing "You are currently impersonating **{name}**" with a "Stop Impersonating" button.

3. **Stop Impersonation:** Clicking the button posts to the leave route. The session key is removed and the original superadmin is restored via `Auth::loginUsingId()`.

## Safety Guards

- Superadmins cannot impersonate themselves
- The `impersonated_by` session key is checked by the Inertia middleware and shared as `auth.is_impersonating` to all pages
- The leave route is available outside the superadmin middleware group so the impersonated (standard) user can trigger it

## Frontend Components

- **Impersonation Banner** (`resources/js/components/impersonation-banner.tsx`) — Rendered in the app sidebar layout
- **App Layout** (`resources/js/layouts/app-layout.tsx`) — Also renders an inline banner for non-sidebar pages
- **Admin Users Page** (`resources/js/pages/admin/users.tsx`) — Contains the "Impersonate" button per user row

## Testing

4 Pest feature tests cover:

- Non-superadmin blocked (403)
- Successful impersonation with session storage
- Self-impersonation prevention
- Leave impersonation and restore original user

Run tests:

```bash
php artisan test tests/Feature/Admin/ImpersonationTest.php
```
