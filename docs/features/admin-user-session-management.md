# Admin User Session Management

## Overview

Admin User Session Management allows superadmins to inspect active sessions for any user and terminate suspicious or stale sessions directly from the admin panel.

This extends platform-level operational security by giving support/admin staff visibility into active devices and immediate remediation controls without requiring end-user intervention.

## Features

- **Per-user active session listing** from the admin panel
- **Session metadata visibility** including user agent, IP address, and last activity
- **Current admin session protection** to prevent terminating the acting admin's current request session from this flow
- **Single session revocation** for targeted device logout
- **Bulk revocation** of all other sessions for a selected user
- **Access control** restricted to superadmins

## How to Use

1. Open **Admin Panel → Users** (`/admin/users`)
2. Open a user row actions menu
3. Click **Manage Sessions**
4. Review active sessions for that user
5. Use:
   - **Revoke** to terminate one session
   - **Terminate All Sessions** to remove all non-current sessions for that user

## Architecture

### Backend

- **Controller**: `App\Http\Controllers\Admin\UserSessionController`
  - `index(User $user)` — returns user session list for admin view
  - `destroy(User $user, string $sessionId)` — terminates one matching session
  - `destroyAll(Request $request, User $user)` — terminates all matching sessions except current request session

### Routes

| Method | URI | Route Name |
|---|---|---|
| GET | `/admin/users/{user}/sessions` | `admin.users.sessions.index` |
| DELETE | `/admin/users/{user}/sessions/{sessionId}` | `admin.users.sessions.destroy` |
| DELETE | `/admin/users/{user}/sessions` | `admin.users.sessions.destroy-all` |

All routes are under `auth` + `superadmin` middleware.

### Frontend

- **Users page entrypoint**: `resources/js/pages/admin/users.tsx`
  - Adds **Manage Sessions** action in row dropdown
- **Session page**: `resources/js/pages/admin/user-sessions.tsx`
  - Renders session table and revoke controls

## Testing

Run targeted tests:

```bash
php artisan test --compact tests/Feature/Admin/UserSessionTest.php tests/Feature/Admin/AdminUserTest.php
```

Coverage includes:

- superadmin session list access
- non-superadmin access denial
- single-session termination
- terminate-all behavior
- authorization denial for termination actions by non-superadmins
