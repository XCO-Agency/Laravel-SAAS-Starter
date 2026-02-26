# GDPR Data Export

The application provides a self-service data export feature for workspace owners and admins to comply with GDPR data portability requirements.

## Overview

Workspace moderators can export all data associated with their workspace into a structured JSON file. This includes:

- Workspace metadata
- Member details (names, emails, roles)
- Active invitations
- API Keys (metadata only, no secrets)
- Webhook endpoints and logs
- Activity logs

## Implementation

### WorkspaceExportService

The `App\Services\WorkspaceExportService` is responsible for aggregating data from various models and preparing the JSON structure.

### Controller

The `App\Http\Controllers\WorkspaceExportController` handles the download request, ensuring the user has the appropriate permissions via `WorkspacePolicy`.

## Accessing Exports

1. Navigate to **Workspace Settings**.
2. Scroll to the **Data Management** section.
3. Click **Export JSON**.

## Security

- Exports are only available to users with the `owner` or `admin` role in the workspace.
- Passwords, 2FA secrets, and API key plain-text values are **never** included in the export.
- The export is generated on-demand and streamed to the user.

## Customization

To add more data to the export, update the `export()` method in `WorkspaceExportService.php`.
