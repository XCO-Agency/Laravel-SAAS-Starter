# Workspace Suspension

The Workspace Suspension feature allows administrators (Super Admins) to temporarily suspend access to a workspace without deleting its data. When a workspace is suspended, all users (including the owner) are locked out of its resources and redirected to a dedicated suspension page.

## Key Components

1. **Database Columns:**
    * `suspended_at` (timestamp): Indicates when the workspace was suspended. If null, the workspace is active.
    * `suspension_reason` (string, nullable): Stores the reason for the suspension (e.g., "Billing failure", "Terms of Service violation").

2. **Middleware (`EnsureWorkspaceNotSuspended`):**
    * This middleware (`workspace.suspended` alias) runs on virtually all authenticated workspace routes.
    * If the user's `currentWorkspace` has a non-null `suspended_at` value, the middleware intercepts the request.
    * Instead of throwing a 403 error (which can cause issues with Inertia.js testing and UX client-side navigation), the middleware redirects the user to the `workspace.suspended` named route.
    * **Exemptions:** The middleware explicitly allows access to routes necessary for switching workspaces (`workspaces.switch`), viewing the trash (`workspaces.trash.*`), viewing their profile (`profile.edit`), and the suspension page itself.

3. **Suspension Page (`resources/js/pages/workspace-suspended.tsx`):**
    * A branded, static Inertia page that informs the user their workspace has been suspended.
    * It displays the date of suspension and the specific reason provided by the administrator.
    * It offers a "Switch Workspace" action to allow the user to navigate to other active workspaces they belong to without being fully locked out of the application.

4. **Admin Interactions (`resources/js/pages/admin/workspaces.tsx` & `Admin\WorkspaceController`):**
    * Super Admins can view the suspension status of all workspaces.
    * The table row actions dropdown includes options to "Suspend Workspace" (if active) or "Unsuspend Workspace" (if currently suspended).
    * Clicking "Suspend Workspace" opens a modal dialog requiring the admin to input a reason.
    * The `WorkspaceController@suspend` and `WorkspaceController@unsuspend` endpoints handle the backend logic, utilizing the `superadmin` middleware group.

## Testing

The feature is comprehensively tested in `tests/Feature/Admin/WorkspaceSuspensionTest.php`, which covers:

* Super Admins gaining the ability to suspend/unsuspend.
* Standard users receiving 403 Forbidden when attempting to perform admin suspension actions.
* The middleware successfully intercepting standard dashboard routes and redirecting to the suspension page.
* The middleware successfully allowing standard users to view the 'workspace suspended' page, switch workspaces, and access their own profiles.
