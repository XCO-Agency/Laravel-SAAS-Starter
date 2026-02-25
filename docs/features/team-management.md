# Team Management & Roles

## Overview

Because the SaaS operates on a **Workspace** model rather than isolated user accounts, **Team Management** is a fundamental feature. It governs how users are invited, how they operate within a workspace, and what data they can manipulate based on their Role.

## Core Features

- **Email Invitations:** Safely invite new users to a workspace via email. If the user doesn't exist, a placeholder flow handles their eventual registration and linking.
- **Granular Roles:** Users have explicit roles strictly mapped to their membership to a specific workspace (a single user could be an Owner in "Acme Corp" and a Member in "Beta LLC").
  - `owner`: Absolute control. Can delete workspaces, upgrade billing, and invite others.
  - `admin`: Operational control. Can manage settings and team members, but cannot modify billing or delete the workspace.
  - `member`: Standard access. Can use the core SaaS features but cannot manipulate the workspace structure itself.
- **Invite Revocation & Team Deletions:** Admins can withdraw pending invites and remove existing members. Owners cannot be removed.

## Technical Implementation

- **Database:** Roles are stored directly on the `workspace_user` pivot table connecting `users` to `workspaces`.
- **Policy Enforcement:** Custom middleware (`EnsureWorkspaceAdmin`, `EnsureWorkspaceOwner`) sit directly in `routes/web.php` to brutally block unauthorized access to settings/billing endpoints.
- **Frontend Security:** The active user's role for the current workspace is shared globally via `HandleInertiaRequests` as `$page.props.currentWorkspace.role`. React components conditionally render upgrade buttons or settings tabs based on this prop.

## Inviting a User Flow

1. Admin navigates to `/settings/workspace/members`.
2. Admin submits an email address and assigns an initial role.
3. A `WorkspaceInvitation` record is created, and an email is dispatched containing a unique signed URL.
4. Invitee clicks URL → Registers/Logs in → `AcceptWorkspaceInvitation` sweeps the invite and attaches the user model to the Workspace pivot.
