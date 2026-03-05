# Workspace Trash & Restore

## Overview

When a workspace is deleted, it enters a **30-day trash period** during which the owner can restore it. After the grace period, a daily artisan command permanently removes the workspace and all its data.

## How It Works

### Soft Delete

Workspaces use Laravel's `SoftDeletes` trait. When a workspace is "deleted" via the settings page, it is soft-deleted — its `deleted_at` column is set, and it becomes invisible to normal queries.

### Trash Page

Owners can view their trashed workspaces at **Workspaces → View Trash**. Each trashed workspace shows:

- When it was deleted
- How many days remain in the grace period
- Restore and permanent delete actions

### Restoring a Workspace

Clicking **Restore** brings the workspace back to active status and sets it as the user's current workspace.

### Permanent Deletion

Owners can permanently delete a workspace from the trash immediately, bypassing the grace period. A confirmation dialog is shown before this action.

### Automatic Pruning

The `workspaces:prune-trashed` artisan command runs daily via the scheduler and permanently removes workspaces that have been trashed for more than 30 days.

```bash
php artisan workspaces:prune-trashed           # Default: 30 days
php artisan workspaces:prune-trashed --days=7   # Custom grace period
```

## Authorization

- Only workspace **owners** can view, restore, or permanently delete trashed workspaces.
- The `WorkspacePolicy` enforces `restore` and `forceDelete` gates.

## Routes

| Method   | URI                                    | Action       |
|----------|----------------------------------------|--------------|
| `GET`    | `/workspaces/trash`                    | List trashed |
| `POST`   | `/workspaces/trash/{id}/restore`       | Restore      |
| `DELETE` | `/workspaces/trash/{id}`               | Force delete |

## Tests

Run `php artisan test --compact tests/Feature/WorkspaceTrashTest.php` to execute the 8 tests covering listing, restore, force delete, authorization, and pruning.
