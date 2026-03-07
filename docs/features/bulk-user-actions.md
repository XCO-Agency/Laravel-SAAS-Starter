# Admin Bulk User Actions

## Overview

Bulk User Actions extend the admin Users page with the ability to select multiple users and perform batch operations: verify email, suspend, or export to CSV. This significantly improves admin workflow efficiency when managing large user bases.

## Available Actions

### Bulk Verify Email

Marks the `email_verified_at` timestamp for all selected users who have not yet verified their email. Users who are already verified are skipped — their original verification timestamp is preserved.

### Bulk Suspend

Soft-deletes all selected users. The current admin is automatically excluded from suspension to prevent accidental self-lockout. Suspended users can still be restored individually.

### Bulk Export (CSV)

Downloads a CSV file containing the selected users' data:

| Column | Description |
|---|---|
| ID | User ID |
| Name | Full name |
| Email | Email address |
| Superadmin | Yes/No |
| Email Verified | Verification date or "Not verified" |
| Created At | Registration date |
| Deleted At | Suspension date (if applicable) |

Soft-deleted users are included in exports.

## How to Use

1. Navigate to **Admin Panel → Users** (`/admin/users`)
2. Check the checkbox next to users you want to act on (or use the header checkbox to select all on the current page)
3. A bulk actions toolbar appears with the count of selected users
4. Click the desired action button:
   - **Verify Email** — verifies unverified email addresses
   - **Export CSV** — downloads a CSV file
   - **Suspend** — soft-deletes selected users
5. Confirm the action when prompted
6. Selection is cleared after successful operations

## Architecture

### Routes

| Method | Route | Action |
|---|---|---|
| POST | `/admin/users/bulk-verify-email` | Verify email for selected users |
| POST | `/admin/users/bulk-suspend` | Suspend selected users |
| POST | `/admin/users/bulk-export` | Export selected users to CSV |

All routes require `superadmin` middleware.

### Validation

All bulk endpoints validate:
- `user_ids` is required and must be a non-empty array
- Each ID must be an integer
- For verify and suspend, each ID must exist in the `users` table

### Key Files

| File | Purpose |
|---|---|
| `app/Http/Controllers/Admin/UserController.php` | Bulk action methods |
| `resources/js/pages/admin/users.tsx` | Selection UI and bulk toolbar |

## Testing

Tests are in `tests/Feature/Admin/BulkUserActionsTest.php` and cover:

- **Verify Email**: verifies unverified users, skips already verified, validates input, denies non-admins
- **Suspend**: suspends selected users, prevents self-suspension, denies non-admins
- **Export**: generates valid CSV with user data, includes deleted users, denies non-admins
