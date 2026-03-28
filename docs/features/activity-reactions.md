# Activity Reactions

Emoji reaction system for workspace activities, allowing team members to quickly respond with emoji reactions.

## Features

- **Toggle Reactions**: Click to add, click again to remove
- **Multiple Reactions**: Users can add multiple different emoji to the same activity
- **Grouped Display**: Reactions are grouped by emoji with user counts
- **Real-time Updates**: Broadcast via Laravel Reverb when reactions change

## Database Schema

### `activity_reactions` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `activity_id` | bigint | ID of the activity_log entry |
| `user_id` | bigint | Foreign key to user |
| `reaction` | string | Emoji character (max 10 chars) |
| `created_at` | timestamp | Creation timestamp |

**Indexes:**
- `activity_id` for querying by activity
- Unique composite index on `[activity_id, user_id, reaction]`

## API Endpoints

### List Reactions
```
GET /workspaces/{workspace}/reactions?activity_id={id}
```

**Response:**
```json
{
  "data": {
    "👍": {
      "count": 5,
      "users": ["Alice", "Bob", "Charlie"],
      "has_reacted": true
    },
    "🎉": {
      "count": 2,
      "users": ["Alice", "Dave"],
      "has_reacted": true
    }
  }
}
```

### Toggle Reaction
```
POST /workspaces/{workspace}/reactions
```

**Request Body:**
```json
{
  "activity_id": 123,
  "reaction": "👍"
}
```

**Response:**
```json
{
  "message": "Reaction added.",
  "data": {
    "added": true,
    "reaction": "👍",
    "activity_id": 123,
    "reactions": [...]
  }
}
```

If the user already reacted with that emoji, it will be removed and `added` will be `false`.

### Remove Reaction
```
DELETE /workspaces/{workspace}/activities/{activity}/reactions
```

**Request Body:**
```json
{
  "reaction": "👍"
}
```

## Model Methods

```php
use App\Models\ActivityReaction;

// Toggle a reaction (returns true if added, false if removed)
$added = ActivityReaction::toggle($activityId, $userId, '👍');

// Check if user has reacted
$hasReacted = ActivityReaction::hasUserReacted($activityId, $userId, '👍');

// Get grouped reactions for an activity
$reactions = ActivityReaction::getGroupedForActivity($activityId);
// Returns: [['reaction' => '👍', 'count' => 5, 'user_ids' => [1, 2, 3]], ...]
```

## Real-time Broadcasting

When a reaction is toggled, a `WorkspaceActivityWasLogged` event is broadcast to all workspace members:

```php
broadcast(new WorkspaceActivityWasLogged(
    $workspace,
    "Reaction 👍 added",
    'info'
))->toOthers();
```

This allows the frontend to update reaction counts in real-time.

## Usage Example

```php
// In a controller
public function store(Request $request, Workspace $workspace)
{
    $validated = $request->validate([
        'activity_id' => 'required|integer|exists:activity_log,id',
        'reaction' => 'required|string|max:10',
    ]);

    $added = ActivityReaction::toggle(
        $validated['activity_id'],
        $request->user()->id,
        $validated['reaction']
    );

    $reactions = ActivityReaction::getGroupedForActivity($validated['activity_id']);

    return response()->json([
        'message' => $added ? 'Reaction added.' : 'Reaction removed.',
        'data' => compact('added', 'reactions'),
    ]);
}
```

## Testing

Run the reaction tests:

```bash
php artisan test --filter=ActivityReactionTest
```

**Test Coverage:**
- Toggle behavior (add/remove)
- Multiple reactions per user
- Grouped reaction counts
- Duplicate reaction prevention

## Common Emoji Reactions

Common reactions used in the system:

| Emoji | Meaning |
|-------|---------|
| 👍 | Like / Approved |
| ❤️ | Love / Appreciated |
| 🎉 | Celebrate |
| 🚀 | Ship it |
| 👀 | Looking at this |
| ✨ | Excellent |
