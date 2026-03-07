# Admin Application Log Viewer

Super-admins can monitor, filter, and manage Laravel system logs directly from the backend dashboard. This tool is critical for debugging issues, observing system behavior in staging/production, and sharing logs with developers without needing direct server SSH access.

## Features

- **Log File Selection**: View all log files currently in the `storage/logs/` directory.
- **Detailed Log Inspection**: Visual output of the latest log entries, complete with environment details, timestamps, severity badges, and messages.
- **Search & Filtering**: Real-time filtering by severity level (INFO, ERROR, CRITICAL, etc.) and full-text search across log messages.
- **Log Management**:
  - **Download**: Export specific `.log` files to your local machine.
  - **Delete**: Clear out huge or old log files with a single click (after confirmation).

## Security

Only users with the `superadmin` role can access the Log Viewer component.

- The `LogViewerController` strictly guards against path traversal attacks to ensure that files outside `storage/logs` cannot be accessed or deleted (e.g. `../` payloads trigger a `403 Forbidden`).

## Technical Details

- **Controller**: `App\Http\Controllers\Admin\LogViewerController`
- **Frontend Page**: `resources/js/pages/admin/logs.tsx`
- **Storage Path**: Read access to `storage/logs/*.log`.
- **Parsing**: A robust Regex pattern is used on the server side to detect the standard Laravel log entry format (`[YYYY-MM-DD HH:MM:SS] environment.LEVEL: Message`) and properly concatenate multi-line stack traces with the original error payload.

## Usage

1. Navigate to **Admin Panel > System Logs** (in the sidebar).
2. The UI will load up all matched `.log` files. Select the target file (by default `laravel.log`).
3. Scroll through log entries and use the top right filter array to drill down on issues.
4. If a log file exceeds significant size, consider downloading a local copy or deleting it through the UI, allowing Laravel to start fresh.
