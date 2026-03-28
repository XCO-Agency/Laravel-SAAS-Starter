# Custom Workspace Fields

Extensible custom field system for adding metadata to workspaces with support for multiple field types.

## Features

- **7 Field Types**: Text, Textarea, Number, Date, Boolean, Select, URL
- **Field Validation**: Type-specific validation with custom rules
- **Required Fields**: Mark fields as mandatory
- **Default Values**: Pre-populate fields with default values
- **Field Ordering**: Drag-and-drop reordering
- **Polymorphic Values**: Can be applied to any entity (workspaces, users, etc.)

## Database Schema

### `custom_field_definitions` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `workspace_id` | bigint | Owning workspace |
| `name` | string | Field label |
| `key` | string | Unique identifier (snake_case) |
| `type` | enum | Field type |
| `options` | json | Select options (for select type) |
| `required` | boolean | Required field flag |
| `default_value` | text | Default value |
| `order` | integer | Display order |

### `custom_field_values` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `custom_field_definition_id` | bigint | Field definition |
| `customizable_type` | string | Polymorphic type |
| `customizable_id` | bigint | Polymorphic ID |
| `value` | json | Stored value |

## Field Types

| Type | Description | Value Storage |
|------|-------------|---------------|
| `text` | Single line text | String |
| `textarea` | Multi-line text | String |
| `number` | Numeric value | Float |
| `date` | Date picker | Date string (Y-m-d) |
| `boolean` | Yes/No toggle | Boolean |
| `select` | Dropdown | Selected option string |
| `url` | URL/Link | Validated URL string |

## API Endpoints

### List Field Definitions
```
GET /workspaces/{workspace}/custom-fields
```

### Create Field
```
POST /workspaces/{workspace}/custom-fields
```

**Request Body:**
```json
{
  "name": "Project Code",
  "type": "text",
  "required": true,
  "default_value": "PROJ-001"
}
```

**Select Type:**
```json
{
  "name": "Priority",
  "type": "select",
  "options": ["Low", "Medium", "High"],
  "required": false
}
```

### Update Field
```
PUT /workspaces/{workspace}/custom-fields/{field}
```

### Delete Field
```
DELETE /workspaces/{workspace}/custom-fields/{field}
```

### Reorder Fields
```
POST /workspaces/{workspace}/custom-fields/reorder
```

**Request Body:**
```json
{
  "fields": [
    {"id": 1, "order": 2},
    {"id": 2, "order": 0},
    {"id": 3, "order": 1}
  ]
}
```

### Update Field Values
```
PUT /workspaces/{workspace}/custom-field-values
```

**Request Body:**
```json
{
  "customizable_type": "App\\Models\\Workspace",
  "customizable_id": 1,
  "values": [
    {"field_id": 1, "value": "PROJ-123"},
    {"field_id": 2, "value": "High"}
  ]
}
```

### Get Field Values
```
GET /workspaces/{workspace}/custom-field-values?customizable_type={type}&customizable_id={id}
```

## Usage Example

```php
use App\Models\CustomFieldDefinition;
use App\Models\CustomFieldValue;
use App\Models\Workspace;

// Create a custom field
$field = CustomFieldDefinition::create([
    'workspace_id' => $workspace->id,
    'name' => 'Project Code',
    'key' => 'project_code',
    'type' => 'text',
    'required' => true,
]);

// Set value
CustomFieldValue::updateOrCreate(
    [
        'custom_field_definition_id' => $field->id,
        'customizable_type' => Workspace::class,
        'customizable_id' => $workspace->id,
    ],
    ['value' => 'PROJ-123']
);

// Get value
$value = CustomFieldValue::where('custom_field_definition_id', $field->id)
    ->where('customizable_type', Workspace::class)
    ->where('customizable_id', $workspace->id)
    ->first();

echo $value->getDisplayValue(); // "PROJ-123"
```

## Validation

```php
$field = CustomFieldDefinition::find(1);

// Check if value is valid
$isValid = $field->validateValue('some value');

// Cast value to proper type
$castedValue = $field->getCastedValue('42.5'); // 42.5 (float)
```

## Model Methods

```php
// Field definition methods
$field->isSelect();      // Check if select type
$field->isBoolean();     // Check if boolean type
$field->getSelectOptions(); // Get select options
$field->validateValue($value); // Validate a value

// Value methods
$value->getDisplayValue(); // Get formatted display value
$value->definition;        // Get field definition
```

## Testing

```bash
php artisan test --filter=CustomFieldTest
```

**Test Coverage:**
- Field CRUD operations
- All field type validations
- Required field enforcement
- Type casting (number, boolean, date)
- Select field option validation
- Field reordering
- Value storage and retrieval
