# Workspace Comments & Discussions

A polymorphic comment system that enables team members to discuss workspace activities and announcements with threaded replies and @mentions support.

## Features

- **Polymorphic Comments**: Attach comments to activities, announcements, or any commentable entity
- **Threaded Replies**: Nested comment threads for organized discussions
- **@Mentions**: Notify users when mentioned with @username syntax
- **Authorization**: Authors can edit/delete their own comments; workspace admins can moderate
- **Soft Deletes**: Comments are soft-deleted to maintain conversation history

## Database Schema

### `workspace_comments` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `workspace_id` | bigint | Foreign key to workspace |
| `user_id` | bigint | Foreign key to author |
| `parent_id` | bigint | Self-referential for replies (nullable) |
| `commentable_type` | string | Polymorphic type (activity, announcement) |
| `commentable_id` | bigint | Polymorphic ID |
| `content` | text | Comment body |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |
| `deleted_at` | timestamp | Soft delete timestamp |

## API Endpoints

### List Comments
```
GET /workspaces/{workspace}/comments?commentable_type={type}&commentable_id={id}
```

**Query Parameters:**
- `commentable_type` (optional): Filter by type (activity, announcement)
- `commentable_id` (optional): Filter by commentable ID

**Response:**
```json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 20,
    "total": 5
  }
}
```

### Create Comment
```
POST /workspaces/{workspace}/comments
```

**Request Body:**
```json
{
  "content": "This is my comment with @john mention",
  "commentable_type": "activity",
  "commentable_id": 123,
  "parent_id": null
}
```

### Update Comment
```
PUT /workspaces/{workspace}/comments/{comment}
```

**Authorization:** Only the comment author can update.

### Delete Comment
```
DELETE /workspaces/{workspace}/comments/{comment}
```

**Authorization:** Comment author or workspace admin.

### List Replies
```
GET /workspaces/{workspace}/comments/{comment}/replies
```

## Mention System

The `MentionService` automatically:
1. Extracts @username mentions from comment content
2. Finds matching users in the workspace
3. Sends `UserMentioned` notifications to mentioned users
4. Excludes self-mentions

### Notification Channels

- **Database**: Always created
- **Email**: Respects user's notification preferences for the "mentions" category

## Usage Example

```php
use App\Services\MentionService;
use App\Models\WorkspaceComment;

// Create a comment
$comment = WorkspaceComment::create([
    'workspace_id' => $workspace->id,
    'user_id' => auth()->id(),
    'content' => 'Great work @sarah! Can you review this @john?',
    'commentable_type' => 'activity',
    'commentable_id' => $activity->id,
]);

// Process mentions (done automatically in controller)
app(MentionService::class)->processMentions($comment, $workspace);
```

## Testing

Run the comment tests:

```bash
php artisan test --filter=WorkspaceCommentTest
```

**Test Coverage:**
- CRUD operations
- Authorization checks
- Nested replies
- Workspace membership enforcement
- Mention extraction

## Permissions

| Action | Author | Admin | Owner | Member |
|--------|--------|-------|-------|--------|
| View | ✓ | ✓ | ✓ | ✓ |
| Create | ✓ | ✓ | ✓ | ✓ |
| Update | ✓ | ✗ | ✗ | ✗ |
| Delete | ✓ | ✓ | ✓ | ✗ |
