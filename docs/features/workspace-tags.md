# Workspace Tags

A flexible tagging system for categorizing workspaces with color-coded labels.

## Features

- **Color-Coded Labels**: Visual organization with preset color palette
- **Polymorphic Design**: Can be extended to tag other entities (comments, activities)
- **Global vs Workspace Tags**: System-wide tags or workspace-specific
- **Tag Management**: Create, edit, delete, and assign tags
- **Usage Tracking**: See how many workspaces use each tag

## Database Schema

### `tags` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `name` | string | Tag name |
| `slug` | string | URL-friendly identifier |
| `color` | string | Hex color code |
| `description` | text | Tag description |
| `workspace_id` | bigint | Scope (null = global) |
| `user_id` | bigint | Tag creator |

### `taggables` Pivot Table

| Column | Type | Description |
|--------|------|-------------|
| `tag_id` | bigint | Foreign key to tag |
| `taggable_type` | string | Polymorphic type |
| `taggable_id` | bigint | Polymorphic ID |

## API Endpoints

### List Workspace Tags
```
GET /workspaces/{workspace}/tags
```

### Create and Assign Tag
```
POST /workspaces/{workspace}/tags
```

**Request Body:**
```json
{
  "name": "Urgent",
  "color": "#ef4444",
  "description": "High priority workspace"
}
```

### Attach Existing Tag
```
POST /workspaces/{workspace}/tags/attach
```

**Request Body:**
```json
{
  "tag_id": 123
}
```

### Detach Tag
```
DELETE /workspaces/{workspace}/tags/{tag}/detach
```

### List Available Tags
```
GET /workspaces/{workspace}/tags/available
```

Returns tags not yet assigned to the workspace.

## Preset Colors

| Color | Hex | Use Case |
|-------|-----|----------|
| Red | #ef4444 | Urgent/Critical |
| Orange | #f97316 | Warning |
| Amber | #f59e0b | Caution |
| Lime | #84cc16 | Success/Low |
| Green | #22c55e | Active/Go |
| Emerald | #10b981 | Completed |
| Teal | #14b8a6 | Information |
| Cyan | #06b6d4 | Neutral |
| Sky | #0ea5e9 | Sky/Blue |
| Blue | #3b82f6 | Primary |
| Indigo | #6366f1 | Secondary |
| Violet | #8b5cf6 | Creative |
| Purple | #a855f7 | Special |
| Fuchsia | #d946ef | Highlight |
| Pink | #ec4899 | Love/Care |
| Rose | #f43f5e | Important |
| Slate | #64748b | Default |

## Usage Example

```php
use App\Models\Tag;
use App\Models\Workspace;

// Create a tag
$tag = Tag::create([
    'name' => 'Development',
    'color' => '#3b82f6',
    'workspace_id' => $workspace->id,
    'user_id' => auth()->id(),
]);

// Attach to workspace
$workspace->tags()->attach($tag->id);

// Get all tags for workspace
$tags = $workspace->tags;

// Filter workspaces by tag
$workspaces = Workspace::whereHas('tags', function ($query) {
    $query->where('slug', 'development');
})->get();
```

## Model Methods

```php
$tag->isGlobal(); // Check if tag is global (workspace_id is null)
$tag->workspaces; // Get all workspaces with this tag

$workspace->tags; // Get all tags for workspace
$workspace->tags()->attach($tagId); // Add tag
$workspace->tags()->detach($tagId); // Remove tag
```

## Testing

```bash
php artisan test --filter=WorkspaceTagTest
```

**Test Coverage:**
- Tag CRUD operations
- Workspace attachment/detachment
- Unique slug generation
- Color validation
- Authorization checks
