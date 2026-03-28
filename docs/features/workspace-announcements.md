# Workspace Announcements

Workspace-level announcement system for broadcasting important information to all workspace members with pinning, dismissal tracking, and scheduling capabilities.

## Features

- **Rich Content**: Title and content body for detailed announcements
- **Type Badges**: Visual indicators (info, warning, success)
- **Pinning**: Pin important announcements to the top
- **Dismissal**: Members can dismiss announcements they've read
- **Scheduling**: Set publish and expiry dates
- **Read Tracking**: Track which members have seen each announcement

## Database Schema

### `workspace_announcements` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `workspace_id` | bigint | Foreign key to workspace |
| `user_id` | bigint | Foreign key to creator |
| `title` | string | Announcement title |
| `content` | text | Announcement body |
| `type` | enum | Type: info, warning, success |
| `pinned` | boolean | Whether pinned to top |
| `dismissible` | boolean | Whether members can dismiss |
| `published_at` | timestamp | Optional publish date |
| `expires_at` | timestamp | Optional expiry date |

### `workspace_announcement_reads` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `announcement_id` | bigint | Foreign key to announcement |
| `user_id` | bigint | Foreign key to user |
| `read_at` | timestamp | When the user dismissed/read it |

## API Endpoints

### List Announcements
```
GET /workspaces/{workspace}/announcements
```

Returns active announcements sorted by pinned status and creation date.

### Create Announcement
```
POST /workspaces/{workspace}/announcements
```

**Request Body:**
```json
{
  "title": "System Maintenance",
  "content": "We will be performing scheduled maintenance...",
  "type": "warning",
  "pinned": true,
  "dismissible": true,
  "expires_at": "2026-03-30T00:00:00Z"
}
```

**Authorization:** Workspace admins and owners only.

### Update Announcement
```
PUT /workspaces/{workspace}/announcements/{announcement}
```

### Delete Announcement
```
DELETE /workspaces/{workspace}/announcements/{announcement}
```

### Dismiss Announcement
```
POST /workspaces/{workspace}/announcements/{announcement}/dismiss
```

Marks the announcement as read for the current user.

### Pin/Unpin Announcement
```
POST /workspaces/{workspace}/announcements/{announcement}/pin
```

**Request Body:**
```json
{
  "pinned": true
}
```

Note: Pinning one announcement automatically unpins any currently pinned announcement.

### Get Active Banners
```
GET /workspaces/{workspace}/announcements/banners/active
```

Returns announcements that should be displayed as banners:
- Pinned announcements (always)
- Non-dismissible announcements
- Unread dismissible announcements

## Type Styles

Each announcement type has associated styling:

| Type | Background | Border | Icon |
|------|------------|--------|------|
| info | bg-blue-50 | border-blue-200 | info |
| warning | bg-amber-50 | border-amber-200 | alert-triangle |
| success | bg-emerald-50 | border-emerald-200 | check-circle |

## Model Methods

```php
$announcement->isPublished();   // Check if published_at has passed
$announcement->isExpired();     // Check if expires_at has passed
$announcement->isActive();      // Check if published and not expired
$announcement->markAsReadBy($user);
$announcement->isReadBy($user);
$announcement->getTypeStyles(); // Get visual styling array
```

## Scopes

```php
// Active announcements (published and not expired)
WorkspaceAnnouncement::active()->get();

// Pinned announcements
WorkspaceAnnouncement::pinned()->get();

// For a specific workspace
WorkspaceAnnouncement::forWorkspace($workspaceId)->get();
```

## Testing

Run the announcement tests:

```bash
php artisan test --filter=WorkspaceAnnouncementTest
```

**Test Coverage:**
- CRUD operations
- Permission checks (admin/owner vs member)
- Pinning functionality
- Dismissal tracking
- Expiry handling
- Schedule publishing

## Permissions

| Action | Member | Admin | Owner |
|--------|--------|-------|-------|
| View | ✓ | ✓ | ✓ |
| Create | ✗ | ✓ | ✓ |
| Update | ✗ | ✓ | ✓ |
| Delete | ✗ | ✓ | ✓ |
| Pin | ✗ | ✓ | ✓ |
| Dismiss | ✓ | ✓ | ✓ |
