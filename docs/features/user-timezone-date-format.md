# User Timezone & Date Format

## Overview

Users can configure personal timezone and date format preferences from **Settings → Profile**. These preferences are stored per-user and exposed in shared Inertia props, enabling consistent date rendering across the application.

## What Is Stored

The following fields are persisted on `users`:

- `timezone` (IANA timezone string, e.g. `America/New_York`)
- `date_format` (allowed date display format string, e.g. `Y-m-d`)

## Profile Settings UX

On the profile settings page, users can:

- Select a timezone from curated common options.
- Select a date format from predefined formats.
- Save both preferences together with profile changes.

## Validation

The profile update request enforces:

- `timezone` must be a valid timezone.
- `date_format` must match one of the allowed formats.

Invalid values are rejected with standard validation errors.

## Runtime Availability

`HandleInertiaRequests` shares both preferences in auth props so frontend components can consume them without additional API calls.

## Tests

Run targeted tests:

```bash
php artisan test --compact tests/Feature/Settings/ProfilePreferencesTest.php
```

This suite verifies preference persistence and validation behavior.
