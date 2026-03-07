# Workspace Analytics Dashboard

## Overview

The Workspace Analytics Dashboard provides workspace admins and owners with a comprehensive view of their workspace's usage metrics, resource utilization, and growth trends. It displays member growth, API key usage, webhook delivery stats, weekly activity volume, and recent activity events.

## Access

- **URL**: `/workspaces/analytics`
- **Route Name**: `workspaces.analytics`
- **Permission**: Requires workspace admin or owner role (via `update` gate)
- **Navigation**: Settings sidebar → Analytics (under the General section)

## Features

### Overview Cards
- **Members**: Total workspace members with count of pending invitations
- **API Keys**: Count of active (non-expired) API keys
- **Webhooks**: Count of active webhook endpoints out of total
- **Invitations**: Number of pending invitations awaiting response

### Member Growth Chart
- Bar chart showing new members joined over the last 6 months
- Monthly aggregation from `workspace_user` pivot timestamps

### Weekly Activity Chart
- Bar chart showing activity log events over the last 8 weeks
- Counts all `Activity` entries by workspace members

### Webhook Delivery Stats
- Success, failed, and pending webhook deliveries in the last 30 days
- Visual progress bar for success rate
- Empty state when no deliveries exist

### API Keys List
- Up to 10 most recent API keys
- Shows key name, prefix, last usage time, expiration status
- Badges for expired keys

### Recent Activity Feed
- Last 10 activity log entries across the workspace
- Shows description, causer name, event type, and relative timestamp
- Includes both workspace-level events and member-level events

## Data Sources

| Metric | Source |
|--------|--------|
| Member count | `workspace_user` pivot |
| Member growth | `workspace_user.created_at` timestamps |
| API keys | `workspace_api_keys` table |
| Webhook endpoints | `webhook_endpoints` table |
| Webhook deliveries | `webhook_logs` table (`status` column) |
| Weekly activity | Spatie `activity_log` table |
| Recent activity | Spatie `activity_log` table |
| Pending invitations | `workspace_invitations` table |

## Technical Details

- **Controller**: `App\Http\Controllers\WorkspaceAnalyticsController`
- **Frontend**: `resources/js/pages/workspaces/analytics/index.tsx`
- **Layout**: Uses `SettingsLayout` with `fullWidth` for charts and tables
- All queries run against local DB — no external API calls
- No new database migrations required

## Tests

- **File**: `tests/Feature/WorkspaceAnalyticsTest.php`
- **Coverage**: 10 tests, 123 assertions
- Page access for admins/owners
- Permission denial for regular members
- Overview stats (members, API keys, webhook endpoints)
- Member growth chart (6 months)
- Weekly activity chart (8 weeks)
- Webhook delivery stats (success/failed/total)
- API key listing with usage info
- Recent activity display
- Pending invitation counting
- Empty state handling (no resources)
