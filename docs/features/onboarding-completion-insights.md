# Onboarding Completion Insights

## Overview

The Onboarding Completion Insights feature provides superadmins with a funnel-based dashboard showing where users drop off during the onboarding wizard. It tracks each step (Welcome, Workspace Setup, Plan Selection) with both "viewed" and "completed" events, enabling data-driven improvements to the onboarding flow.

## Architecture

### Backend

- **Model:** `App\Models\OnboardingStepLog` — stores each step event with user, step name, and action (viewed/completed).
- **Controller (Tracking):** `App\Http\Controllers\OnboardingController::trackStep()` — accepts step tracking POSTs from the frontend wizard.
- **Controller (Admin):** `App\Http\Controllers\Admin\OnboardingInsightsController` — aggregates step data into funnel metrics, drop-off analysis, and daily completion trends.
- **Migration:** `onboarding_step_logs` table with indexed step/action and user_id columns.

### Frontend

- **Wizard:** `resources/js/pages/onboarding/wizard.tsx` — enhanced to POST step tracking events as users navigate between wizard steps.
- **Admin Page:** `resources/js/pages/admin/onboarding-insights.tsx` — funnel visualization, drop-off analysis, daily completion chart.
- **Layout:** Accessible from the Admin Panel sidebar under "Onboarding".

## Database Schema

| Column     | Type      | Description                           |
|------------|-----------|---------------------------------------|
| `id`       | bigint    | Primary key                           |
| `user_id`  | foreignId | The user performing the step          |
| `step`     | string    | Step identifier: `welcome`, `workspace`, `plan` |
| `action`   | string    | Action type: `viewed` or `completed`  |
| `created_at` / `updated_at` | timestamp | Timestamps           |

## Step Tracking

Steps are tracked automatically:

1. **Welcome (viewed):** Logged when user visits `/onboarding`
2. **Welcome (completed) + Workspace (viewed):** Logged when user advances from step 1 to step 2
3. **Workspace (completed) + Plan (viewed):** Logged when user advances to the plan selection step
4. **Plan (completed):** Logged when the onboarding form is submitted successfully

Each user-step-action combination is deduplicated via `firstOrCreate`.

### API Endpoint

- `POST /onboarding/track-step` — accepts `{ step, action }` for frontend-driven tracking
- Validation: step must be `welcome|workspace|plan`, action must be `viewed|completed`

## Dashboard Metrics (30-day window)

1. **Key Metrics Cards:**
   - New Registrations
   - Fully Onboarded count
   - Completion Rate (%)
   - Average Time to Complete

2. **Onboarding Funnel:**
   - Dual-bar visualization showing viewed vs completed counts per step
   - Per-step completion rate percentages

3. **Drop-off Points:**
   - Users who viewed but didn't complete each step
   - Color-coded severity (green < 30%, amber 30-50%, red > 50%)

4. **Daily Completions (14 days):**
   - Bar chart of users who completed onboarding per day

## Access Control

- Only superadmins (`is_superadmin = true`) can access the insights page
- Step tracking endpoint requires authentication (any user)
- Route: `GET /admin/onboarding-insights`
- Named route: `admin.onboarding-insights.index`

## Tests

9 Pest feature tests cover:
- Page renders for superadmins
- Non-admin access is forbidden
- Correct completion rate metrics
- Funnel step data accuracy
- Drop-off calculations
- Step tracking via POST endpoint
- Deduplication of step logs
- Input validation on step tracking
- Automatic welcome step logging on page visit

## Files

- `app/Models/OnboardingStepLog.php`
- `app/Http/Controllers/OnboardingController.php` (updated with `trackStep` + `logStep`)
- `app/Http/Controllers/Admin/OnboardingInsightsController.php`
- `database/migrations/2026_03_05_211947_create_onboarding_step_logs_table.php`
- `resources/js/pages/onboarding/wizard.tsx` (updated with step tracking calls)
- `resources/js/pages/admin/onboarding-insights.tsx`
- `tests/Feature/Admin/OnboardingInsightsTest.php`
