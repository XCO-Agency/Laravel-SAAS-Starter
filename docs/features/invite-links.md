# Shareable Invitation Links

## Overview

Workspace admins and owners can generate reusable join links that allow anyone with the link to join the workspace — no email invitation required. Each link can be configured with a role, max uses, and expiration.

## How It Works

1. **Create a Link**: On the Team page, click "Create Link" to generate a shareable join URL.
2. **Configure**: Choose the role (Member or Admin), an optional max-use limit, and an optional expiry time.
3. **Share**: Copy the generated URL and share it with anyone who should join.
4. **Join**: Recipients visit the link, sign in (or register), and are added to the workspace automatically.
5. **Revoke**: Delete a link at any time to prevent further usage.

## Database Schema

**`workspace_invite_links` table:**

| Column | Type | Description |
|---|---|---|
| `id` | bigint | Primary key |
| `workspace_id` | FK | Workspace this link belongs to |
| `created_by` | FK | User who created the link |
| `token` | string(64) | Unique, URL-safe token |
| `role` | string | Role assigned on join (`member` or `admin`) |
| `max_uses` | int, nullable | Maximum number of uses (null = unlimited) |
| `uses_count` | int | Current number of times this link was used |
| `expires_at` | timestamp, nullable | When the link expires (null = never) |

## API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/team/invite-links` | Create a new invite link |
| `DELETE` | `/team/invite-links/{id}` | Revoke an invite link |
| `GET` | `/join/{token}` | Public page to preview the invitation |
| `POST` | `/join/{token}` | Accept the invite and join the workspace |

## Authorization

- **Create/Revoke**: Users with the workspace `manage_team` capability (owners and admins by default, plus members explicitly granted this permission)
- **View/Join**: Any authenticated user (public pages accessible to guests)

## Key Files

- **Model**: `app/Models/WorkspaceInviteLink.php`
- **Controller**: `app/Http/Controllers/WorkspaceInviteLinkController.php`
- **Form Request**: `app/Http/Requests/StoreInviteLinkRequest.php`
- **Migration**: `database/migrations/2026_03_05_022657_create_workspace_invite_links_table.php`
- **Frontend (Team)**: `resources/js/Pages/Team/index.tsx` (Invite Links section)
- **Frontend (Join)**: `resources/js/Pages/Team/join.tsx`
- **Tests**: `tests/Feature/Team/InviteLinkTest.php`
