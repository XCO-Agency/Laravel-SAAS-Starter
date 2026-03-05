# Notification Channel Preferences

## Overview

Users can now control notification delivery channels independently:

- Email notifications
- In-app notifications

Category-level controls (marketing, security, team, billing) remain available and apply across enabled channels.

## Data Shape

`notification_preferences` is stored as a JSON object with two top-level groups:

- `channels`
  - `email` (boolean)
  - `in_app` (boolean)
- `categories`
  - `marketing` (boolean)
  - `security` (boolean)
  - `team` (boolean)
  - `billing` (boolean)

## Backward Compatibility

Legacy flat preferences are normalized automatically in the backend:

- Old shape (`marketing/security/team/billing`) is mapped to `categories`.
- Missing `channels` defaults to both enabled.

## Delivery Behavior

`DataExportCompleted` now uses channel + category checks:

- Security category disabled → no delivery.
- Email enabled → mail channel used.
- In-app enabled → database channel used.

## Tests

Run targeted tests:

```bash
php artisan test --compact tests/Feature/Settings/NotificationPreferencesTest.php tests/Feature/Notifications/DataExportCompletedNotificationTest.php
```
