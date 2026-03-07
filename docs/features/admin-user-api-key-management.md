# Admin User API Key Management

## Overview

Admin User API Key Management gives superadmins the ability to inspect, issue, and revoke personal API tokens for any platform user from the admin panel.

This supports security incident response (rapid token revocation), support workflows, and controlled token issuance for enterprise customers.

## Features

- **Per-user token inventory** with name and last-used metadata
- **Admin token issuance** with one-time plaintext token reveal
- **Immediate token revocation** for compromised or obsolete credentials
- **Scoped revocation safety** so a token is only removed when it belongs to the selected user
- **Superadmin-only access** via existing admin middleware

## How to Use

1. Open **Admin Panel → Users** (`/admin/users`)
2. Open a user actions menu
3. Click **Manage API Tokens**
4. Review current tokens for that user
5. Optionally:
   - create a new token
   - revoke an existing token

## Architecture

### Backend

- **Controller:** `App\Http\Controllers\Admin\UserApiTokenController`
  - `index(User $user)`
  - `store(Request $request, User $user)`
  - `destroy(User $user, string $tokenId)`

### Routes

| Method | URI | Route Name |
|---|---|---|
| GET | `/admin/users/{user}/api-tokens` | `admin.users.api-tokens.index` |
| POST | `/admin/users/{user}/api-tokens` | `admin.users.api-tokens.store` |
| DELETE | `/admin/users/{user}/api-tokens/{tokenId}` | `admin.users.api-tokens.destroy` |

All routes are protected by `auth` + `superadmin` middleware.

### Frontend

- **Users entrypoint:** `resources/js/pages/admin/users.tsx`
- **Management page:** `resources/js/pages/admin/user-api-tokens.tsx`

## Testing

```bash
php artisan test --compact tests/Feature/Admin/UserApiTokenManagementTest.php tests/Feature/Settings/ApiTokenTest.php
```

Coverage includes:

- non-superadmin access denial
- superadmin view/create/revoke behavior
- per-user token scoping protection
- regression checks for existing settings token functionality
