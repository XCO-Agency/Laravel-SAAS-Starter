# User API Key Management

The User API Key Management feature allows individuals to generate, view, and revoke personal access tokens (PATs) for programmatic API access to their resources.

## Features

- **Generate Tokens:** Users can quickly generate a new API token with a specific mnemonic name (e.g., "GitHub Actions", "Local Script").
- **View Active Tokens:** The UI lists all active tokens alongside their last-used timestamp and creation date.
- **Revoke Tokens:** Users can immediately revoke any API token. Once revoked, any application relying on that token will immediately lose access.
- **Security:** Token payloads are only shown *once* upon creation. Thereafter, only the name and metadata are visible, adhering to strict security best practices.

## Technical Details

This feature is built upon Laravel's native first-party package **Sanctum**.

- **Underlying Package:** `laravel/sanctum`
- **Controller:** `App\Http\Controllers\Settings\ApiTokenController`
- **Frontend Page:** `resources/js/pages/settings/api-tokens.tsx`
- **Data Model:** Tokens are attached directly to the `User` model via the `HasApiTokens` trait and are stored in the `personal_access_tokens` database table.

## Usage

1. Navigate to **User Settings > Account > API Tokens**.
2. To create a new token, enter a recognizable name in the "Token Name" input and click "Create".
3. A success banner will appear. **Copy the token immediately**, as it will not be displayed again.
4. To revoke access for an existing token, click "Revoke" on the specific active token and confirm the deletion prompt.

## Note on Workspace API Keys

User API Keys are uniquely scoped to the *User* and bear the permissions of the creating user.
For *Workspace-level* programmatic access that isn't tied to an individual's lifecycle, refer to the [Workspace API Keys](./workspace-api-keys.md) feature.
