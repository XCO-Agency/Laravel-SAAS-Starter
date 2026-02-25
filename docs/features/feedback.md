# User Feedback Widget

The feedback widget provides an in-app mechanism for authenticated users to submit bug reports, feature ideas, and general feedback. Admins can review submissions from a dedicated panel.

## Architecture

```
POST /feedback                          → FeedbackController@store
GET  /admin/feedback                    → Admin\FeedbackController@index
PUT  /admin/feedback/{feedback}         → Admin\FeedbackController@update
DELETE /admin/feedback/{feedback}       → Admin\FeedbackController@destroy
```

### Database Schema — `feedback` table

| Column       | Type      | Notes                                |
|--------------|-----------|--------------------------------------|
| `id`         | ulid (PK) |                                      |
| `user_id`    | FK        | Nullable — anonymous fallback        |
| `workspace_id`| FK       | Nullable                             |
| `type`       | enum      | `bug`, `idea`, `general`             |
| `message`    | text      | 10–2000 characters                   |
| `status`     | enum      | `new`, `reviewed`, `archived`        |
| `page_url`   | string    | Auto-captured from `Referer` header  |
| `user_agent` | string    | Auto-captured                        |
| `metadata`   | json      | Extensible payload                   |

### Key Files

| File | Role |
|------|------|
| `app/Models/Feedback.php` | Eloquent model with user/workspace relationships |
| `app/Http/Controllers/FeedbackController.php` | User-facing store endpoint |
| `app/Http/Controllers/Admin/FeedbackController.php` | Admin index, update, destroy |
| `app/Http/Requests/StoreFeedbackRequest.php` | Validation (type enum, message length) |
| `resources/js/components/feedback-widget.tsx` | Floating button + popover |
| `resources/js/pages/admin/feedback.tsx` | Admin review panel |

## User-Facing Widget

The widget renders as a fixed floating button (`bottom-6 right-6`) on all authenticated pages via `app-sidebar-layout.tsx`.

### Features

- **Type selector:** Bug Report 🐛 / Feature Idea 💡 / General 💬
- **Character counter:** 0–2000 limit with real-time counter
- **Validation errors:** Shown inline beneath the textarea
- **Success state:** Animated ✅ confirmation for 2.5 seconds, then auto-closes
- **Outside-click close** and X button
- **Inputs reset** on success (message cleared, type reset to General)

Submissions are sent via `axios.post('/feedback')` (not `router.post`) to avoid Inertia protocol conflicts with the JSON response.

## Admin Review Panel (`/admin/feedback`)

Accessible only to superadmins. Features:

- **Status tabs:** All / New / Reviewed / Archived with live counts
- **Type filter dropdown:** All Types / Bug Reports / Feature Ideas / General
- **Per-submission actions:**
  - ✅ Mark Reviewed (`PUT /admin/feedback/{id}` with `status: reviewed`)
  - 📦 Archive (`PUT /admin/feedback/{id}` with `status: archived`)
  - 🗑️ Delete (`DELETE /admin/feedback/{id}`)
- Shows user name, email, workspace, page URL, and submission date
- Full pagination (20 per page)

## Validation Rules

```php
'type'    => ['required', 'string', 'in:bug,idea,general'],
'message' => ['required', 'string', 'min:10', 'max:2000'],
```

Custom messages explain the constraints clearly (e.g., `"Please provide at least 10 characters of detail."`).

## Translations

All UI strings are translation-ready via `feedback.*` keys in all 4 locales (`en`, `fr`, `es`, `ar`).

## Demo Data

The `DatabaseSeeder` seeds 12 realistic feedback entries (mix of types and statuses) attributed to the demo and admin users.

## Tests

```bash
php artisan test --compact tests/Feature/FeedbackSubmissionTest.php
php artisan test --compact tests/Feature/Admin/FeedbackTest.php
```

| Test | Coverage |
|------|----------|
| Authenticated submission | Happy path |
| Unauthenticated rejection | 401 |
| Invalid type rejection | 422 validation |
| Empty/short message rejection | 422 validation |
| Auto-capture of `page_url` and `user_agent` | Asserts stored values |
| Admin index access control | Superadmin only |
| Admin status update (reviewed, archived) | Both paths |
| Invalid status rejection | 422 validation |
| Admin delete | Soft check |
| Filter by type/status | Inertia assertion |
