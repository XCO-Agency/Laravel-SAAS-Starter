# Workspace Templates

A template system that allows users to save workspace configurations and quickly create new workspaces with pre-defined settings.

## Features

- **Save as Template**: Convert any existing workspace into a reusable template
- **Public/Private Templates**: Share templates with the community or keep them private
- **Template Categories**: Organize templates by type (Development, Marketing, Sales, etc.)
- **Configuration Preservation**: Templates capture settings, webhook structure, and custom fields
- **One-Click Creation**: Create new workspaces from templates instantly
- **Duplicate Templates**: Make copies of existing templates

## Database Schema

### `workspace_templates` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Template creator |
| `workspace_id` | bigint | Source workspace (nullable) |
| `name` | string | Template name |
| `description` | text | Template description |
| `icon` | string | Icon identifier (building, rocket, etc.) |
| `is_public` | boolean | Visibility setting |
| `configuration` | json | Stored workspace configuration |
| `category` | string | Template category |
| `usage_count` | integer | Times template has been used |

## Configuration Storage

Templates store workspace configuration as JSON:

```php
[
    'settings' => [
        'timezone' => 'America/New_York',
        'date_format' => 'Y-m-d',
        'language' => 'en',
    ],
    'features' => [
        'two_factor_required' => false,
        'allowed_email_domains' => ['example.com'],
    ],
    'webhooks_structure' => [...],
    'default_roles' => [...],
    'custom_fields' => [...],
]
```

## API Endpoints

### List Templates
```
GET /workspace-templates?category={category}&search={query}
```

Returns public templates and user's private templates with optional filtering.

### Create Template
```
POST /workspace-templates
```

**Request Body:**
```json
{
  "workspace_id": 1,
  "name": "Development Team Setup",
  "description": "Standard dev team configuration",
  "icon": "code",
  "is_public": true,
  "category": "development"
}
```

### Create Workspace from Template
```
POST /workspace-templates/{template}/use
```

**Request Body:**
```json
{
  "name": "My New Workspace",
  "slug": "my-new-workspace"
}
```

### Duplicate Template
```
POST /workspace-templates/{template}/duplicate
```

Creates a private copy of the template.

## Available Icons

| Icon | Description |
|------|-------------|
| `building` | Default building icon |
| `code` | Code/development |
| `rocket` | Launch/startup |
| `briefcase` | Business |
| `palette` | Design/Creative |
| `headphones` | Support |
| `chart-bar` | Analytics |
| `users` | Team/HR |
| `star` | Featured |
| `zap` | Quick/Automation |

## Categories

- `general` - General purpose
- `development` - Software development
- `marketing` - Marketing teams
- `sales` - Sales teams
- `support` - Customer support
- `design` - Design/Creative
- `operations` - Operations/IT

## Usage Example

```php
use App\Services\WorkspaceTemplateService;

// Create template from existing workspace
$template = app(WorkspaceTemplateService::class)->createFromWorkspace(
    auth()->user(),
    $workspace,
    [
        'name' => 'Standard Team Setup',
        'icon' => 'users',
        'category' => 'general',
        'is_public' => true,
    ]
);

// Create workspace from template
$newWorkspace = app(WorkspaceTemplateService::class)->createWorkspaceFromTemplate(
    auth()->user(),
    $template,
    ['name' => 'Acme Corp Team', 'slug' => 'acme-corp']
);
```

## Testing

```bash
php artisan test --filter=WorkspaceTemplateTest
```

**Test Coverage:**
- Template CRUD operations
- Public/private visibility
- Workspace creation from template
- Template duplication
- Category and search filtering
