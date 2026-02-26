# Onboarding Checklist

An interactive progress tracker displayed on the dashboard that guides new users through essential setup steps for their workspace.

## Overview

The onboarding checklist automatically computes completion state for key setup tasks:

- **Complete your profile** — Add a bio to your user profile
- **Enable two-factor authentication** — Secure your account with 2FA
- **Invite a team member** — Add at least one colleague to your workspace
- **Connect billing** — Subscribe to a plan for full access

The checklist includes a progress bar, clickable step links, and a permanent dismiss option.

## Architecture

### Backend

- **Controller:** `App\Http\Controllers\OnboardingChecklistController`
  - `GET /onboarding-checklist` — Returns step completion data as JSON
  - `POST /onboarding-checklist/dismiss` — Sets `onboarding_checklist_dismissed_at` on the user

### Frontend

- **Component:** `resources/js/components/onboarding-checklist.tsx`
  - Collapsible card with animated progress bar
  - Fetches state on mount from the JSON endpoint
  - Rendered at the top of the dashboard page

### Database

- `users.onboarding_checklist_dismissed_at` — Nullable datetime column

## Customization

Steps are hardcoded in the controller for simplicity. To add a new step:

1. Add a new entry to the `$steps` array in `OnboardingChecklistController@index`
2. Set the `completed` check to whatever condition suits the step
3. Provide an `href` pointing to the relevant settings page
