# Workspaces & Multi-tenancy

## Overview

The platform supports a comprehensive multi-tenant architecture using **Workspaces**. Instead of users owning resources directly, resources belong to Workspaces, and users belong to Workspaces with specific roles.

## Core Features

- **Multiple Workspaces**: A user can create and belong to multiple workspaces simultaneously.
- **Workspace Switching**: Users can seamlessly switch their active workspace via the dashboard dropdown. The backend tracks the active workspace context (`current_workspace_id` on the `User` model).
- **Personal Workspaces**: Every user receives a default "Personal Workspace" upon registration.
- **Roles & Permissions**: Fine-grained access control within a workspace (Owner, Admin, Member).
- **Invitations**: Workspace owners and admins can invite new members via email. Invitations expire and can be accepted/declined by the invitee.

## Technical Implementation

- **Models:**
  - `Workspace`: Represents the tenant. Implements `HasFeatures` (for feature flags) and uses Cashier `Billable` for subscription management.
  - `WorkspaceInvitation`: Represents pending invites.
- **Relationships:**
  - `User` belongsToMany `Workspace` (via `workspace_user` pivot table which stores the `role`).
  - `Workspace` hasMany `WorkspaceInvitation`.
- **Middleware:** The active workspace is globally shared with the frontend via the `HandleInertiaRequests` middleware, exposing `$page.props.currentWorkspace`.
- **Frontend:** Managed under `settings/workspace` (Settings, Members, Plans).

## Managing Members

1. **Inviting:** Admins input an email address. The system optionally registers a provisional account if the email is unseen, or links the pending invite to an existing account.
2. **Accepting:** The invited user clicks a signed URL in the email to accept the invitation and securely join the workspace team.
3. **Removing:** Admins can revoke access, except for the Workspace Owner.
