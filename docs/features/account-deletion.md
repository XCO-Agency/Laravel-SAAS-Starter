# Account Deletion (Self-Service)

## Overview

Users can delete their own accounts through the profile settings page. The deletion process validates the user's password, handles workspace ownership cleanup, cancels active subscriptions, and soft-deletes the user record.

## Access

- **URL:** `/settings/profile` (Delete Account section)
- **Middleware:** `auth`

## Features

### Password Confirmation

Users must enter their current password to confirm the deletion. Invalid passwords are rejected with a validation error.

### Workspace Cleanup

| Scenario | Behavior |
|----------|----------|
| Personal workspace (no other members) | Soft-deleted along with the user |
| Shared workspace (user is sole member) | Soft-deleted along with the user |
| Shared workspace (other members exist) | **Blocked** — user must transfer ownership or remove members first |

### Subscription Cancellation

If any owned workspace has an active Stripe subscription, it is cancelled immediately (`cancelNow()`) before the workspace is deleted.

### Session Handling

After deletion, the user is logged out, the session is invalidated, and the CSRF token is regenerated. The user is redirected to the homepage.

## Frontend

The delete account UI is rendered by the `DeleteUser` component (`resources/js/components/delete-user.tsx`):

- Destructive warning banner
- Dialog with password confirmation
- Inertia `<Form>` component with Wayfinder action
- Displays both `password` and `account` validation errors

## Testing

4 Pest feature tests cover:

- Successful deletion with correct password (soft-delete)
- Rejection with incorrect password
- Personal workspace cascade deletion
- Blocking deletion when shared workspace has other members

Run tests:

```bash
php artisan test tests/Feature/Settings/AccountDeletionTest.php
```
