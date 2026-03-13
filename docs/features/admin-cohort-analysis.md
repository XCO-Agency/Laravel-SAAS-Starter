# Admin Cohort Retention Analysis

A triangular cohort retention table showing what percentage of users who signed up in a given month were still active (logged in) in subsequent months. A critical SaaS growth metric for identifying activation and retention drop-offs.

## Accessing the Dashboard

URL: `/admin/cohort-analysis` (requires `is_superadmin`)

## How It Works

- The last **6 signup cohorts** (calendar months) are displayed.
- For each cohort, **4 retention columns** are computed:
  - **Month 0**: always 100% (the cohort baseline).
  - **Month 1, 2, 3**: percentage of cohort members who made at least one successful login in that calendar month.
- **Future months** are shown as `—` and excluded from averages.
- An **average row** at the bottom summarises retention across all cohorts.

## Colour Coding

| Colour | Threshold |
|--------|-----------|
| Green | ≥ 70% |
| Amber | 40–69% |
| Red | < 40% |

## Architecture

| File | Role |
|------|------|
| `app/Http/Controllers/Admin/CohortAnalysisController.php` | Data aggregation + Inertia render |
| `resources/js/pages/admin/cohort-analysis.tsx` | Triangular cohort table UI |
| `resources/js/layouts/admin-layout.tsx` | Nav entry (Cohort Analysis) |
| `routes/web.php` | `GET /admin/cohort-analysis` route |

## Data Sources

- **Cohort membership**: `users.created_at` grouped by calendar month.
- **Retention activity**: `login_activities` table, filtered by `is_successful = true` and the target month window, using `DISTINCT user_id`.

## Testing

Test file: `tests/Feature/Admin/CohortAnalysisTest.php`

- Superadmin can access the page
- Non-admin is forbidden
- Response has correct Inertia component + `cohorts` prop shape
- Month 0 is always 100% in every cohort
- Actual login activity is reflected in retention percentages

Run: `php artisan test --compact tests/Feature/Admin/CohortAnalysisTest.php`
