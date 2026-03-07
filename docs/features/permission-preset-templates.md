# Permission Preset Templates

## Overview

Permission Preset Templates allow super-admins to define reusable bundles of permissions that can be quickly applied to team members. Instead of manually toggling individual permissions for each user, workspace admins can select a preset to apply a predefined set of permissions in one click.

## Available Permissions

The system supports four granular permissions:

| Permission | Description |
|---|---|
| `manage_team` | Invite, remove, and manage team members |
| `manage_billing` | Access billing settings and manage subscriptions |
| `manage_webhooks` | Create, edit, and delete webhooks |
| `view_activity_logs` | View workspace audit/activity logs |

## Default Presets

Four presets are seeded by default:

| Preset | Permissions |
|---|---|
| **Team Lead** | manage_team, view_activity_logs |
| **Finance Manager** | manage_billing, view_activity_logs |
| **Operations Admin** | manage_team, manage_webhooks, view_activity_logs |
| **Full Access** | All four permissions |

## Admin Management

### Accessing Presets

Super-admins can manage presets via **Admin Panel → Permissions** (`/admin/permission-presets`).

### Creating a Preset

1. Click "Create Preset"
2. Enter a unique name (required, max 100 characters)
3. Optionally add a description
4. Select one or more permissions from the checkbox grid
5. Click "Create Preset"

### Editing a Preset

1. Click the "Edit" button on a preset card
2. Modify name, description, or permissions
3. Click "Save Changes"

### Deleting a Preset

1. Click the "Delete" button on a preset card
2. Confirm the deletion

> **Note:** Deleting a preset does not affect users who already have those permissions applied.

## Using Presets in Team Management

When editing a team member's permissions:

1. Navigate to **Team** page
2. Click "Manage Permissions" on a team member
3. Click any preset button above the permission checkboxes to instantly apply that preset's permissions
4. The permission checkboxes update to reflect the preset's configuration
5. Click "Save Permissions" to persist the changes

Presets serve as a starting point — after applying a preset, you can still toggle individual permissions before saving.

## Architecture

### Database

The `permission_presets` table stores:

| Column | Type | Description |
|---|---|---|
| `id` | bigint | Primary key |
| `name` | string | Unique preset name |
| `description` | string (nullable) | Optional description |
| `permissions` | JSON | Array of permission keys |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

### Key Files

| File | Purpose |
|---|---|
| `app/Models/PermissionPreset.php` | Eloquent model with `AVAILABLE_PERMISSIONS` constant |
| `app/Http/Controllers/Admin/PermissionPresetController.php` | Admin CRUD controller |
| `resources/js/pages/admin/permission-presets.tsx` | Admin management page |
| `resources/js/pages/Team/index.tsx` | Team page with preset selector |

### API Routes (Admin Only)

| Method | Route | Action |
|---|---|---|
| GET | `/admin/permission-presets` | List all presets |
| POST | `/admin/permission-presets` | Create a new preset |
| PUT | `/admin/permission-presets/{preset}` | Update a preset |
| DELETE | `/admin/permission-presets/{preset}` | Delete a preset |

## Testing

Tests are located in `tests/Feature/Admin/PermissionPresetsTest.php` and cover:

- Admin page accessibility and non-admin denial
- CRUD operations (create, update, delete)
- Validation rules (required fields, unique name, valid permissions)
- Presets passed to team page as props
- Model casting and constants
