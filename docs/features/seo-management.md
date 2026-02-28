# SEO Management

## Overview

Admins can manage meta tags (title, description, keywords, Open Graph, Twitter Card) for any page in the application. A global fallback entry covers pages without specific SEO entries. SEO data is shared with every Inertia page via the `seo` shared prop.

## Access

- **URL:** `/admin/seo`
- **Middleware:** `auth`, `superadmin`
- **Nav:** Admin Panel sidebar → "SEO"

## Features

### Per-Page Meta Tags

Each SEO entry targets a specific URL path (e.g., `/pricing`, `/changelog`). The entry stores:

| Field | Description |
|-------|------------|
| `path` | The URL path to match (null for global) |
| `title` | Meta title tag |
| `description` | Meta description (max 511 chars) |
| `keywords` | Comma-separated keywords |

### Open Graph

| Field | Description |
|-------|------------|
| `og_title` | Open Graph title (falls back to meta title) |
| `og_description` | Open Graph description |
| `og_image` | Absolute URL to OG image |
| `og_type` | Content type: `website`, `article`, `product` |

### Twitter Card

| Field | Description |
|-------|------------|
| `twitter_card` | Card type: `summary`, `summary_large_image`, `app`, `player` |
| `twitter_site` | `@site` handle |
| `twitter_creator` | `@creator` handle |
| `twitter_image` | Card image URL |

### Global Fallback

One entry can be marked as "Global". When a page has no specific SEO entry, the global fallback is used. Creating a new global entry automatically unsets the previous one.

### Path Resolution

`SeoMetadata::forPath($path)` tries an exact path match first, then falls back to the global entry.

## Shared Prop

The `HandleInertiaRequests` middleware shares a lazy `seo` prop on every page:

```php
'seo' => fn () => SeoMetadata::forPath($request->path())?->only(...)
```

Frontend pages can use `usePage().props.seo` to render `<Head>` tags with the resolved SEO data.

## Admin UI

The admin page provides:

- **Create**: Form with path, meta fields, collapsible Open Graph and Twitter Card sections
- **Edit**: Inline editing of any entry
- **Delete**: With confirmation dialog
- **Global toggle**: Checkbox to mark entry as site-wide fallback

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/seo` | SEO management page |
| `POST` | `/admin/seo` | Create new entry |
| `PUT` | `/admin/seo/{seoMetadata}` | Update entry |
| `DELETE` | `/admin/seo/{seoMetadata}` | Delete entry |

## Testing

10 Pest feature tests cover:

- Superadmin access control
- Regular user access denial
- Creating page-specific entries
- Creating global fallback entries
- Global uniqueness enforcement
- Updating entries
- Deleting entries
- Path uniqueness validation
- Path-specific resolution
- Global fallback resolution

Run tests:

```bash
php artisan test tests/Feature/Admin/SeoMetadataTest.php
```
