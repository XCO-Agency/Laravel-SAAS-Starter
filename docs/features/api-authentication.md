# API Key Authentication

Enables external integrations to authenticate with the workspace API using the workspace API keys (`wsk_` prefixed tokens) generated in the workspace settings.

## Overview

Workspace API keys are authenticated via `Authorization: Bearer wsk_...` headers. The middleware validates the key hash, checks expiry and scope, and binds the workspace to the request context for downstream route handlers.

## Architecture

### Middleware

- **`App\Http\Middleware\AuthenticateApiKey`** — Registered as `api-key` alias
  - Extracts bearer token from `Authorization` header
  - Validates `wsk_` prefix, SHA-256 hash lookup, expiry, and scope
  - Records `last_used_at` timestamp
  - Returns 401/403 on failure

### API Routes

Routes are prefixed with `/api/v1/` and require the `api-key:read` middleware:

| Endpoint | Method | Scope | Description |
|---|---|---|---|
| `/api/v1/workspace` | GET | `read` | Returns workspace info |
| `/api/v1/members` | GET | `read` | Returns workspace members |

### Usage

```bash
curl -H "Authorization: Bearer wsk_your_api_key_here" \
  http://localhost/api/v1/workspace
```

### Available Scopes

| Scope | Description |
|---|---|
| `read` | Read workspace data |
| `write` | Write workspace data |
| `webhooks` | Manage webhooks |
| `team:read` | Read team members |
| `billing:read` | Read billing info |
