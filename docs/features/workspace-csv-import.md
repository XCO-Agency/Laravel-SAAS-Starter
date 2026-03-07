# Workspace Data Import (CSV)

## Overview

Allows workspace owners and admins to bulk import team members by uploading a CSV file. The import provides a preview step before sending invitations, showing which entries are valid, invalid, or will be skipped.

## Features

- **CSV Upload**: Upload `.csv` or `.txt` files (max 2 MB)
- **Smart Parsing**: Supports multiple header names (`email`, `e-mail`, `email_address`; `role`, `member_role`, `team_role`)
- **Preview Step**: See parsed results before committing — valid, invalid, and skipped entries
- **Duplicate Detection**: Skips existing members, pending invitations, and duplicate rows within the CSV
- **Role Assignment**: Assign admin or member roles per row; defaults to member
- **Plan Limit Awareness**: Respects workspace plan member limits
- **Template Download**: Download a pre-formatted CSV template from the UI

## Architecture

### Backend

- **Service**: `App\Services\CsvImportService` — parses CSV files, validates emails, detects duplicates/existing members
- **Controller**: `App\Http\Controllers\TeamImportController` — handles display, preview, and process actions
- **Authorization**: Uses `manageTeam` gate on the workspace

### Routes

| Method | URI | Action |
|--------|-----|--------|
| GET | `/team/import` | Show import page |
| POST | `/team/import/preview` | Parse CSV and show preview |
| POST | `/team/import/process` | Send invitations for valid entries |

### Frontend

- **Page**: `resources/js/pages/Team/import.tsx`
- File upload with drag-and-drop support
- Preview table showing status badges (valid/invalid/skipped)
- Summary cards for valid, invalid, and skipped counts
- Template download button
- Process button to send invitations

## CSV Format

```csv
email,role
jane@example.com,member
john@example.com,admin
```

- **email** (required): Email address to invite
- **role** (optional): `admin` or `member` (defaults to `member`)

## Validation Rules

- Invalid email addresses are marked as invalid
- Existing workspace members are skipped
- Already-invited emails are skipped
- Duplicate emails within the CSV are skipped
- Unrecognized roles default to `member`

## Testing

```bash
php artisan test --compact tests/Feature/TeamCsvImportTest.php
```

18 tests, 173 assertions covering:
- Page rendering and authorization
- CSV parsing with valid/invalid/missing data
- Duplicate detection (existing members, pending invitations, CSV duplicates)
- Role defaults and unrecognized roles
- Process flow (invitation creation)
- File validation (type, required)
- Case-insensitive email matching
- Alternative header names
- Non-admin access denial
