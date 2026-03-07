# User Session Management (Admin)

Super-admins have the ability to view and terminate active sessions for any user directly from the admin panel. This is useful for security purposes, such as if a user's account is compromised, or for general administrative control.

## Overview

The feature provides a detailed view of all active sessions for a selected user, including:

- **Device / Browser**: Parsed from the User-Agent string.
- **IP Address**: The origin of the session.
- **Last Active**: Human-readable time since the session's last activity.

Admins can terminate specific individual sessions or choose to terminate all sessions simultaneously.

## Technical Details

- **Controller**: `App\Http\Controllers\Admin\UserSessionController`
- **Route Prefix**: `/admin/users/{user}/sessions`
- **Frontend Page**: `resources/js/pages/admin/user-sessions.tsx`
- **Storage**: Sessions are stored using Laravel's native database session driver in the `sessions` table.
- **Security**: The backend prevents super-admins from accidentally terminating their own active session while viewing a user's session list, ensuring they do not lock themselves out randomly.

## Usage

1. Navigate to **Admin Panel > User Management**.
2. Click the action menu (`...`) next to the desired user.
3. Select **Manage Sessions**.
4. You will see a list of all active sessions for that user.
5. Click **Revoke** on an individual session, or **Terminate All Sessions** at the top.
