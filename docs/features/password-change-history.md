# Password Change History

## Overview

Every time a user changes their password, the system records the event with metadata (IP address, user agent, timestamp). The most recent 10 changes are displayed on the password settings page for security auditing.

## How It Works

### Recording Changes

When a user updates their password via **Settings → Password**, the `PasswordController` creates a `PasswordHistory` record with:

- User ID
- IP address of the request
- User agent string
- Timestamp of the change

### Viewing History

The password settings page (`/settings/password`) displays the 10 most recent password changes in reverse chronological order. Each entry shows:

- Date and time of the change
- IP address from which the change was made
- A "Changed" badge

### Data Isolation

Users can only see their own password change history. Other users' records are never exposed.

## Database

| Column       | Type      | Description              |
|-------------|-----------|--------------------------|
| `user_id`   | FK        | The user who changed     |
| `ip_address`| string(45)| IPv4 or IPv6 address     |
| `user_agent`| text      | Browser user agent       |
| `changed_at`| timestamp | When the change occurred |

## Tests

Run `php artisan test --compact tests/Feature/Settings/PasswordHistoryTest.php` to execute the 5 tests covering recording, display, limits, data isolation, and authentication.
