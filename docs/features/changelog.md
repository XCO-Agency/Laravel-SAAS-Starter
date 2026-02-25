# Public Changelog / Release Notes

## Overview

The Changelog feature provides a public-facing release notes page and an admin management interface. Admins create versioned entries with type classification (feature, improvement, fix), and users view a timeline at `/changelog`.

## Public Page

- **URL:** `/changelog` (no authentication required)
- Displays published entries in a vertical timeline, newest first
- Each entry shows version badge, type badge, publication date, title, and body
- Timeline dots are color-coded by type (blue=feature, amber=improvement, green=fix)

## Admin Management

- **URL:** `/admin/changelog`
- **Middleware:** `auth`, `superadmin`
- **Nav:** Admin Panel sidebar → "Changelog"

### CRUD Operations

| Action | Method | Path |
|--------|--------|------|
| List all entries | `GET` | `/admin/changelog` |
| Create entry | `POST` | `/admin/changelog` |
| Update entry | `PUT` | `/admin/changelog/{id}` |
| Delete entry | `DELETE` | `/admin/changelog/{id}` |

### Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Semantic version (e.g. `1.2.0`) |
| `title` | string | Short summary of the release |
| `body` | text | Markdown-formatted release notes |
| `type` | enum | `feature`, `improvement`, or `fix` |
| `is_published` | boolean | Whether visible on the public page |
| `published_at` | timestamp | Auto-set when first published |

### Draft Support

Entries can be created as drafts (`is_published: false`). Draft entries are visible in the admin panel but hidden from the public changelog. Publishing a draft automatically sets `published_at`.

## Database

- **Table:** `changelog_entries`
- **Model:** `App\Models\ChangelogEntry`
- **Factory:** `Database\Factories\ChangelogEntryFactory` (with `draft()` state)

## Demo Data

The `DatabaseSeeder` creates 9 sample changelog entries spanning the platform's feature history, demonstrating all three entry types.

## Testing

9 Pest feature tests cover:

- Superadmin access to admin page
- Regular user access denial
- Entry creation (published + draft)
- Validation of required fields
- Entry update and deletion
- Public page shows only published entries
- Public page accessible without authentication

```bash
php artisan test tests/Feature/Admin/ChangelogTest.php
```
