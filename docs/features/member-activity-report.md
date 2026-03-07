# Workspace Member Activity Report

## Overview

The Member Activity Report provides workspace admins and owners with a per-member breakdown of engagement within their workspace. It surfaces login frequency, action counts, engagement scores, and online status for each team member.

## Access

- **URL**: `/team/activity-report`
- **Route Name**: `team.activity-report`
- **Permission**: Requires `manage_team` permission (workspace owners and admins by default)
- **Navigation**: Settings sidebar → Member Activity (under the General section)

## Features

### Summary Cards
- **Total Members**: Number of users attached to the workspace
- **Active Members**: Members who are online or logged in within the last 7 days, with percentage of total
- **Average Engagement**: Mean engagement score across all members (0–100)
- **Actions (30d)**: Total activity log entries by workspace members in the last 30 days, with per-member average

### Daily Activity Chart
- Stacked bar chart showing the last 14 days
- Green bars = activity log actions, Blue bars = successful logins
- Hover tooltip shows exact counts per day

### Member Details Table
Columns:
- **Member**: Name and email
- **Role**: owner / admin / member
- **Status**: Online (session active in last 5 min), Recent (login in last 7 days), Inactive
- **Last Login**: Relative time since last successful login
- **Logins**: Successful login count in last 30 days
- **Actions**: Activity log entry count in last 30 days
- **Engagement**: Visual progress bar (0–100) with color coding:
  - Green: 70+
  - Amber: 40–69
  - Red: below 40

Members are sorted by engagement score (highest first).

### Engagement Score Formula
- **Login frequency** (40% weight): `min(logins_30d / 30, 1) × 40`
- **Action frequency** (60% weight): `min(actions_30d / 100, 1) × 60`
- Maximum possible score: 100

## Data Sources

| Metric | Source |
|--------|--------|
| Last login | `login_activities` table (successful logins) |
| Login count | `login_activities` where `is_successful = true`, last 30 days |
| Action count | Spatie `activity_log` table filtered by `causer_id` |
| Online status | `sessions` table `last_activity` timestamp |
| Member info | `workspace_user` pivot with `users` table |

## Technical Details

- **Controller**: `App\Http\Controllers\MemberActivityController`
- **Frontend**: `resources/js/pages/Team/activity-report.tsx`
- **Layout**: Uses `SettingsLayout` with `fullWidth` for the table
- All queries run against local DB — no external API calls
- No new database migrations required (uses existing tables)

## Tests

- **File**: `tests/Feature/MemberActivityReportTest.php`
- **Coverage**: 13 tests, 128 assertions
- Page access for admins/owners
- Permission denial for regular members
- Summary stats accuracy
- Engagement score calculation (max score = 100)
- Last login tracking with and without activity
- 30-day login and action window filtering
- 14-day daily activity chart data
- Member status detection (recent, inactive)
- Sort order by engagement score
- Empty workspace handling
