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
- Team member role actions now use explicit transitions (set to `admin`, `member`, or `viewer`) instead of a toggle action, preventing mismatch between action label and submitted role.
- Viewer role support is now explicitly covered in team role update and invite-link creation tests.
- Team permission update requests now enforce a strict backend whitelist for supported permission IDs to prevent invalid capability values from being stored.
- Team role updates now reject self role-change attempts at the backend, matching the frontend safety behavior and preventing direct-request bypass.
- Team permission updates now reject self-permission edit attempts at the backend, aligning with frontend UX safeguards and preventing direct-request bypass.
- Team permission updates now reject admin-role targets at the backend to keep granular capability editing scoped to `member` and `viewer`, matching the Team UI contract.
- Team role updates now enforce workspace membership at the backend and return `404` for non-member targets, preventing cross-workspace role-mutation attempts.

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
