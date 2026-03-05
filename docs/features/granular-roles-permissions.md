# Granular Roles & Permissions

## Overview

The workspace permission model supports capability-based authorization beyond base roles (`owner`, `admin`, `member`).

This update ensures team invite-link management follows granular capabilities by using the same `manageTeam` policy path as other team-management actions.

## Capability Model

Permissions are stored on the `workspace_user.permissions` pivot column as a JSON array.

Examples:

- `manage_team`
- `manage_webhooks`
- `view_activity_logs`
- `manage_billing`

Role defaults remain intact:

- Owners have full access.
- Admins have default management access for non-sensitive actions.
- Members can be granted specific capabilities explicitly.

## What Changed

- Invite-link create authorization now checks `manageTeam` via policy (`StoreInviteLinkRequest`).
- Invite-link revoke authorization now checks `manageTeam` via policy (`WorkspaceInviteLinkController@destroy`).
- Permission-granted members (`manage_team`) can create/revoke invite links without requiring admin role.
- Team permission management UI is grouped into clear access domains (Team Access, Billing Access, Operations Access) with more explicit capability labels.

## Demo Data

`DatabaseSeeder` now grants one member in each demo workspace a sample granular permission (`manage_team`) to demonstrate capability-based access in local/demo environments.

## Tests

Run targeted tests:

```bash
php artisan test --compact tests/Feature/Team/InviteLinkTest.php
```

Coverage includes:

- Member denied without permission
- Member allowed with explicit `manage_team` permission
- Owner/admin behavior preserved
