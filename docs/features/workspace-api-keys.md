# Workspace API Keys

## Overview

Workspace API Keys provide workspace-scoped authentication tokens for external integrations. Unlike personal access tokens (Sanctum), these keys belong to the workspace and are managed by workspace admins.

## Comparison with Personal API Tokens

| Feature | Personal Tokens | Workspace API Keys |
|---------|----------------|-------------------|
| Scope | User-level | Workspace-level |
| Provider | Laravel Sanctum | Custom implementation |
| Location | `/settings/api-tokens` | `/workspaces/api-keys` |
| Prefix | N/A | `wsk_` |
| Expiry | Optional | Optional |
| Custom scopes | Sanctum abilities | `read`, `write`, `webhooks`, `team:read`, `billing:read` |
| Who manages | Any user | Workspace owner/admin |

## Access

- **URL:** `/workspaces/api-keys`
- **Middleware:** `auth`, `verified`, `onboarded`, `workspace`, `require2fa`
- **View:** All workspace members can view keys
- **Create/Revoke:** Requires `manageTeam` Gate (owner or admin)

## Key Format

Keys are generated with the `wsk_` prefix followed by 40 random characters:

```
wsk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

Only the SHA-256 hash and 8-character prefix are stored. The plain-text key is shown once at creation time.

## Available Scopes

| Scope | Description |
|-------|-------------|
| `read` | Read access to workspace data |
| `write` | Write/modify workspace data |
| `webhooks` | Manage webhook endpoints |
| `team:read` | Read team member information |
| `billing:read` | Read billing/subscription info |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/workspaces/api-keys` | List workspace API keys |
| `POST` | `/workspaces/api-keys` | Create a new key |
| `DELETE` | `/workspaces/api-keys/{id}` | Revoke a key |

## Database

- **Table:** `workspace_api_keys`
- **Model:** `App\Models\WorkspaceApiKey`
- **Factory:** `Database\Factories\WorkspaceApiKeyFactory` (with `expired()` state)

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `workspace_id` | FK | Owning workspace |
| `created_by` | FK | User who created the key |
| `name` | string | Human-readable key name |
| `key_hash` | string(64) | SHA-256 hash of the key |
| `key_prefix` | string(8) | First 8 chars for identification |
| `scopes` | JSON | Array of granted scopes |
| `last_used_at` | timestamp | Last API usage timestamp |
| `expires_at` | timestamp | Optional expiry date |

## Testing

9 Pest feature tests cover:

- Admin and member page access
- Key creation with scopes
- Hash and prefix storage verification
- Member creation prevention (authorization)
- Validation of required fields and scopes
- Key revocation by admin
- Member revocation prevention
- Expiry detection

```bash
php artisan test tests/Feature/WorkspaceApiKeyTest.php
```
