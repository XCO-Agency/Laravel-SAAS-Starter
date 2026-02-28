# Usage Dashboard

## Overview

The Usage Dashboard gives workspace members a visual overview of their current resource consumption against plan limits. It displays progress bars, limit counts, and contextual alerts for workspaces, team members, API keys, and webhooks.

## Access

- **URL:** `/usage`
- **Route Name:** `usage.index`
- **Middleware:** `auth`, `verified`, `onboarded`, `workspace`
- **Nav:** App sidebar → "Usage"

## Features

### Plan Display

A highlighted card shows the current workspace's plan name and workspace name.

### Resource Meters

Four resource cards, each displaying:

| Element | Description |
|---------|------------|
| **Label** | Resource type (Workspaces, Team Members, API Keys, Webhooks) |
| **Current / Limit** | Usage count vs plan limit (∞ for unlimited) |
| **Progress Bar** | Visual fill with color coding |
| **Status Icon** | Green check (under limit) or red alert (at limit) |
| **Alert** | Destructive banner when limit is reached |

### Progress Bar Colors

| Usage | Color |
|-------|-------|
| < 80% | Primary (blue) |
| 80-99% | Orange |
| 100% | Destructive (red) |

Unlimited plans (`-1`) show no progress bar.

## PlanLimitService

The `App\Services\PlanLimitService` provides all limit calculations:

- `getLimits(plan)` — Returns limit config for a plan
- `canCreateWorkspace(user)` / `canInviteTeamMember(workspace)` / `canCreateApiKey(workspace)` / `canCreateWebhook(workspace)` — Boolean checks
- `get*LimitMessage()` — Human-readable status messages

Plan limits are configured in `config/billing.php` under each plan's `limits` key.

## Testing

4 Pest tests cover:

- Page rendering with correct Inertia props
- Correct limits for Free/Pro/Business plans
- API key limit checks
- Human-readable limit messages

Run tests:

```bash
php artisan test tests/Feature/UsageDashboardTest.php tests/Feature/PlanLimitServiceTest.php
```
