# Advanced Global Search

The application features a powerful global search powered by **Laravel Scout**, integrated directly into the Command Palette (`Cmd+K`).

## Features

- **Multi-Resource**: Search across Users, Workspaces, Announcements, and Changelog entries simultaneously.
- **Role-Aware Results**:
  - **Superadmins**: Can search for any user or workspace globally.
  - **Regular Users**: Are restricted to searching for members and workspaces they belong to.
- **Dynamic Results**: Results are fetched items-by-items as the user types, with a 300ms debounce.
- **Grouped Categories**: Search results are organized by resource type for better scannability.

## Technical Details

- **Driver**: Currently configured to use the `database` driver for simplicity, but easily switchable to Algolia or Meilisearch in `config/scout.php`.
- **Searchable Models**:
  - `User`: Searchable by name and email.
  - `Workspace`: Searchable by name and slug.
  - `Announcement`: Searchable by title and body.
  - `ChangelogEntry`: Searchable by title, version, and body.

## Extending Search

To make a new model searchable:

1. Add the `Laravel\Scout\Searchable` trait to the model.
2. Implement the `toSearchableArray()` method.
3. Add the model searching logic to `App\Http\Controllers\SearchController.php`.
4. Update the `CommandPalette.tsx` frontend component to handle the new resource type.

## Console Commands

If you add search to existing data, you may need to re-index:

```bash
php artisan scout:import "App\Models\User"
```
