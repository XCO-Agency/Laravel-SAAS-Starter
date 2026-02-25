# Audit Logs

## Overview

The application incorporates an **Audit Logging** system via **Spatie Laravel Activitylog** to track systemic, user, and administrative actions across the platform. This provides a transparent history for security, debugging, and compliance purposes.

## Core Features

1. **Model Tracking:** Automatically logs creation, updates, and deletions on key models (e.g., `Workspace`, `User`, `FeatureFlag`).
2. **Contextual Metadata:** Captures the "causer" (the user who performed the action), the "subject" (the manipulated entity), and detailed old/new property changes.
3. **Admin Visibility:** Super Admins can monitor the entire application’s audit trail via a dedicated, searchable interface in the Admin Panel without needing direct database access.

## Technical Implementation

- **Logging Trait:** Models use `Spatie\Activitylog\Traits\LogsActivity` and specify tracking via the `getActivitylogOptions()` method or `LogOptions`.
- **Database:** Uses standard `activity_log` table provided by Spatie.
- **Admin Controller:** `App\Http\Controllers\Admin\AuditLogController` efficiently eager loads the `causer` and `subject` relationships to serve the paginated, searchable grid.
- **Frontend View:** Located at `resources/js/pages/admin/audit-logs.tsx`, displaying intuitive diffs, raw JSON payloads, and dynamic relationship resolution.

## Viewing Activity Diffs

When an entity is updated, the frontend specifically renders the `properties.old` and `properties.attributes` keys seamlessly, giving administrators a clear view of *what exactly changed* during that event.
