# Session Management

Users can view their active browser sessions and revoke access from other devices. This provides visibility into account access and improves security.

## Overview

The session management page displays all active browser sessions with device info (platform, browser), IP address, and last activity time. Users can revoke individual sessions or all other sessions at once — both operations require password confirmation.

## Architecture

### Backend

- **Controller:** `App\Http\Controllers\Settings\SessionController`
  - `GET /settings/sessions` — Lists active sessions with device parsing
  - `DELETE /settings/sessions/{id}` — Revokes a specific session (password required)
  - `DELETE /settings/sessions` — Revokes all other sessions (password required)

### Frontend

- **Page:** `resources/js/Pages/settings/sessions.tsx`
  - Device icons (desktop/mobile/tablet)
  - "This device" badge on current session
  - Password confirmation dialogs for revocation

### Requirements

- Session driver must be set to `database` (`SESSION_DRIVER=database` in `.env`)
- The `sessions` database table must exist (included by default in Laravel 12)
