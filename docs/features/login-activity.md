# Login Activity Log

## Overview

Track authentication events with IP address, user agent, and success/failure status. Provides users visibility into their account security.

## Schema

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | foreignId | User who attempted login |
| ip_address | string(45) | Client IP address |
| user_agent | text | Full user agent string |
| is_successful | boolean | Whether login succeeded |
| login_at | timestamp | When the attempt occurred |

## Event Listeners

- **`LogSuccessfulLogin`** — Listens for `Illuminate\Auth\Events\Login`, creates a successful activity record.
- **`LogFailedLogin`** — Listens for `Illuminate\Auth\Events\Failed`, creates a failed activity record using the email to find the user.

Both listeners are registered in `AppServiceProvider::boot()`.

## User Agent Parsing

The `LoginActivity::parsedDevice()` method extracts OS and browser from the user agent string:

- **OS**: Windows, macOS, iOS, Android, Linux
- **Browser**: Chrome, Firefox, Safari, Edge, Opera

## Routes

| Method | URI | Action |
|--------|-----|--------|
| GET | `/settings/login-history` | Display login activity page |

## Frontend

Settings page at `resources/js/Pages/settings/login-activity.tsx` shows a list of login events with:

- Relative timestamps
- IP addresses
- Parsed device info
- Success/failure badges
