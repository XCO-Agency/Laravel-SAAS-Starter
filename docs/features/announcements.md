# Announcements

## Overview

The platform includes an **Announcement Banner** system that allows Super Administrators to broadcast critical information, feature releases, and system maintenance alerts across the entire application interface.

## Core Features

- **Global Visibility:** Active announcements are securely appended to `$page.props` and render gracefully at the top of the interface in both the admin and user shells.
- **Styling Variations:** Admins select from 4 distinct visual types: Info (blue), Success (green), Warning (yellow), Danger (red) to visually signal the severity.
- **Scheduling:** Announcements can be configured with specific `starts_at` and `ends_at` timestamps to automate appearance.
- **Dismissible Configurations:** Banners can be mandatory (sticky) or natively dismissible, storing user dismissal state locally.
- **Calls to Action (CTA):** Optional `link_text` and `link_url` buttons facilitate redirection.

## Technical Implementation

1. **Model & Scope:** The `Announcement` model comes with a custom `currentlyActive()` scope validating `is_active`, `starts_at`, and `ends_at`.
2. **Global Sharing:** In `App\Http\Middleware\HandleInertiaRequests`, the latest active announcement is resolved (`Announcement::currentlyActive()->latest()->first()`) and merged into the base Inertia payload.
3. **Component:** `AnnouncementBanner` in `resources/js/components/` dynamically renders the payload with robust Lucide React iconography. The state of dismissal is stored in `localStorage`.
4. **Admin UI:** Super Admins manage announcements using an inline editing UI located at `/admin/announcements`.
