# In-App Product Tour

## Overview

A 4-step guided tour that appears on the dashboard for first-time users. It walks new users through the key sections of the app: Dashboard, Team, Billing, and Workspace Settings. Completion is persisted to the database so the tour never shows again after being finished or skipped.

## Trigger Condition

The tour is shown automatically on the dashboard when `auth.user.tour_completed_at` is `null`. Once the user completes or skips the tour, `tour_completed_at` is stamped with the current timestamp and the tour is permanently dismissed.

## Tour Steps

| # | Target Element | Title | Description |
|---|---------------|-------|-------------|
| 1 | `#dashboard-main` | Your Dashboard | Overview of the workspace dashboard |
| 2 | `#nav-team` | Manage Your Team | Invite members, assign roles, control access |
| 3 | `#nav-billing` | Billing & Plans | Manage plan, upgrade, view invoices |
| 4 | `#nav-settings` | Workspace Settings | Customise workspace branding and policies |

## UI Behaviour

- A semi-transparent backdrop dims the page
- A ring highlight draws attention to the current target element
- A floating tooltip card shows the step title, description, step counter, and progress dots
- "Next →" advances to the next step; on the last step it shows "Done"
- "Skip tour" immediately completes the tour without going through remaining steps
- The tooltip auto-positions below the target element, adjusting to avoid viewport overflow
- The target element is scrolled into view on each step

## Backend

### Migration

Adds `tour_completed_at` (nullable timestamp) after `onboarding_checklist_dismissed_at` on the `users` table.

### Controller

`App\Http\Controllers\TourController::complete()` — sets `tour_completed_at = now()` on the authenticated user and returns `{ success: true }`.

### Route

```
POST /tour/complete    auth middleware    name: tour.complete
```

### Shared Data

`tour_completed_at` is shared in the Inertia `auth.user` object from `HandleInertiaRequests`.

## Frontend Files

| File | Purpose |
|------|---------|
| `resources/js/hooks/use-tour.ts` | Manages step state, defines the 4 tour steps, calls `/tour/complete` |
| `resources/js/components/product-tour.tsx` | Mounts the tooltip for the current step |
| `resources/js/components/tour-tooltip.tsx` | Floating tooltip with backdrop, highlight, progress dots, Next/Done/Skip |

## Testing

3 Pest feature tests cover:

- Authenticated user can POST to `/tour/complete` and receive `{ success: true }`
- `tour_completed_at` is set on the user record after POST
- Unauthenticated request returns 401

```bash
php artisan test tests/Feature/TourControllerTest.php
```
