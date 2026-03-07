# Admin Revenue Analytics

## Overview

The Revenue Analytics dashboard provides super-admins with a comprehensive view of the platform's subscription and revenue health. It displays key billing metrics including MRR, churn rate, trial conversion, plan distribution, and subscription trends — all computed from local billing data.

## Accessing the Dashboard

Navigate to **Admin Panel → Revenue** (`/admin/revenue-analytics`). Only super-admin users can access this page.

## Key Metrics

### Estimated MRR (Monthly Recurring Revenue)

Calculated from active and trialing subscriptions by matching `stripe_price` IDs to plan prices in `config/billing.php`. Yearly subscriptions contribute their monthly equivalent (annual price ÷ 12). Seat-based quantities are factored in via `COALESCE(quantity, 1)`.

### Active Subscriptions

Count of subscriptions with `stripe_status = 'active'`, plus a separate count of trialing subscriptions shown as a secondary metric.

### 30-Day Churn Rate

Percentage of subscriptions canceled in the last 30 days relative to the total subscriber base at the start of that period:

$$\text{Churn Rate} = \frac{\text{Canceled (30d)}}{\text{Active at period start} + \text{Canceled (30d)}} \times 100$$

A rate above 5% triggers a visual warning indicator.

### Trial Conversion Rate

Percentage of subscriptions that had a trial period and successfully converted to active status after the trial ended:

$$\text{Conversion Rate} = \frac{\text{Converted Trials}}{\text{Total Trials}} \times 100$$

## Charts

### Daily New Subscriptions (30 Days)

Bar chart showing new subscription sign-ups per day for the last 30 days. Hover to see exact counts and dates.

### Subscription Flow (6 Months)

Side-by-side bar chart comparing new subscriptions vs cancellations per month. Includes a net change tooltip. Color-coded: green for new, red for canceled.

## Breakdowns

### Plan Distribution

Horizontal progress bars showing the distribution of active and trialing subscriptions across plans. Plans are identified by mapping `stripe_price` to `config/billing.php` plan definitions.

### Revenue by Plan

Detailed cards for each paid plan showing:
- Monthly and yearly subscriber counts
- Estimated MRR contribution
- Percentage of total MRR
- Total MRR summary at the bottom

## Status Alerts

Contextual alert banners appear when:
- There are **past due** subscriptions (amber warning)
- There are **canceled** subscriptions (informational)

## Architecture

### Controller

`App\Http\Controllers\Admin\RevenueAnalyticsController` computes all metrics from local database tables without making external Stripe API calls, ensuring fast page loads.

### Data Sources

| Data | Source |
|---|---|
| Subscription status | `subscriptions.stripe_status` |
| Plan identification | `subscriptions.stripe_price` → `config/billing.php` |
| Pricing | `config('billing.plans.{plan}.price')` |
| Trial tracking | `subscriptions.trial_ends_at` |
| Workspace trials | `workspaces.trial_ends_at` |

### Key Files

| File | Purpose |
|---|---|
| `app/Http/Controllers/Admin/RevenueAnalyticsController.php` | Data computation and rendering |
| `resources/js/pages/admin/revenue-analytics.tsx` | Dashboard frontend |

## Testing

Tests are in `tests/Feature/Admin/RevenueAnalyticsTest.php` and cover:

- Page accessibility for super-admins and non-admin denial
- Subscription summary counts (active, trialing, canceled)
- MRR calculation from plan prices
- Plan distribution grouping
- Churn rate computation
- Trial conversion rate computation
- Daily and monthly subscription data shape
- Revenue breakdown by plan
- Workspace trial counting
- Empty state handling
