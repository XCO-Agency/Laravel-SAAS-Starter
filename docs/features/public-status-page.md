# Public Status Page

## Overview

The Status Page feature provides a public-facing system health page and an admin interface for managing incidents. The overall status banner dynamically reflects the most severe active incident. Admins manage incidents (create, update, delete) from a single inline-form page in the admin panel.

## Public Page

- **URL:** `/status` (no authentication required)
- Shows an overall status banner (operational / degraded / outage / maintenance)
- Lists all incidents from the last 90 days, newest first
- Each incident displays a colour-coded status badge, title, message, creation timestamp, and resolved timestamp when applicable

### Overall Status Logic

The banner reflects the most severe *active* (unresolved) incident:

| Priority | Status | Banner Colour |
|----------|--------|---------------|
| 1st | `outage` | Red |
| 2nd | `degraded` | Amber |
| 3rd | `maintenance` | Blue |
| Default | `operational` | Green |

## Admin Management

- **URL:** `/admin/status`
- **Middleware:** `auth`, `superadmin`
- **Nav:** Admin Panel sidebar → "Status Page"

### CRUD Operations

| Action | Method | Path |
|--------|--------|------|
| List all incidents | `GET` | `/admin/status` |
| Create incident | `POST` | `/admin/status` |
| Update incident | `PUT` | `/admin/status/{status}` |
| Delete incident | `DELETE` | `/admin/status/{status}` |

The create and edit forms are inline on the index page (no separate routes).

### Incident Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Short summary of the incident |
| `message` | text | Detailed description |
| `status` | enum | `operational`, `degraded`, `outage`, `maintenance` |
| `resolved_at` | timestamp | Auto-set when status is set to `operational` |

### Auto-Resolve Logic

- When an incident's status is set to `operational`, `resolved_at` is automatically stamped with the current timestamp.
- When an incident's status is changed away from `operational`, `resolved_at` is cleared back to `null`.

## Database

- **Table:** `status_incidents`
- **Model:** `App\Models\StatusIncident`
- **Factory:** `Database\Factories\StatusIncidentFactory`

### Model Scopes & Methods

| Member | Description |
|--------|-------------|
| `scopeRecent($query)` | Filters to incidents created within the last 90 days |
| `isResolved(): bool` | Returns `true` when `resolved_at` is not null |
| `isActive(): bool` | Returns `true` when unresolved and not `operational` |

### Status Constants

```php
StatusIncident::STATUS_OPERATIONAL  // 'operational'
StatusIncident::STATUS_DEGRADED     // 'degraded'
StatusIncident::STATUS_OUTAGE       // 'outage'
StatusIncident::STATUS_MAINTENANCE  // 'maintenance'
StatusIncident::STATUSES            // all four as array
```

## Demo Data

The `DatabaseSeeder` seeds 3 sample incidents:

1. **Elevated API Response Times** — resolved 10 days ago (`operational`)
2. **Scheduled Database Maintenance** — resolved 5 days ago (`operational`)
3. **Webhook Delivery Delays** — active 4 hours ago (`degraded`)

## Testing

17 Pest feature tests cover:

- Public page renders without authentication
- Only last 90 days of incidents are shown
- Status banner reflects most severe active incident
- Operational status when all incidents are resolved or none exist
- `resolved_at` included for resolved incidents
- Superadmin can create, update, and delete incidents
- Non-admin and guests are forbidden from admin routes
- Auto-resolve on operational status set (create and update)
- `resolved_at` cleared when reverting to non-operational
- Required field validation

```bash
php artisan test tests/Feature/Controllers/StatusPageControllerTest.php tests/Feature/Admin/StatusIncidentControllerTest.php
```
