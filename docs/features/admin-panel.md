# Admin Panel

## Overview

The application includes a powerful, separate **Admin Panel** exclusively for Super Administrators (`is_superadmin = true`). It allows platform owners to manage the global health, data, and configuration of the SaaS.

## Core Features

1. **Admin Dashboard:** High-level metrics tracking total users, active workspaces, daily signups, and plan distribution graphs.
2. **User Management:** View, search, edit, and impersonate all registered users on the platform.
3. **Impersonation:** Super admins can "login as" any user to troubleshoot issues exactly as the user sees them. A global persistent banner reminds the admin they are impersonating someone, providing a 1-click "Leave Impersonation" button.
4. **Workspace Management:** View all workspaces, filter by active/deleted/trial states, and monitor member counts.
5. **Announcements:** Create and schedule global banners to be displayed to all users across the app.
6. **Feature Flags:** Manage system-wide or targeted rollouts using Laravel Pennant.
7. **Audit Logs:** Monitor systemic activity and security events globally.

## Technical Implementation

- **Routing:** All admin routes are prefixed with `/admin` and protected by the `App\Http\Middleware\AdminMiddleware`.
- **Frontend:** The Admin Panel uses a distinct structural layout (`admin-layout.tsx`) separating it entirely from the standard customer SaaS flow (`app-layout.tsx`).
- **Data Access:** Controllers in `App\Http\Controllers\Admin\*` bypass standard tenant scoping to provide a global view of all database records.
