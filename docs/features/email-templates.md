# Email Templates

Dynamic, database-driven email templates for the Laravel SaaS Starter's transactional mail system.

## Overview

The email template system allows Super Admins to modify the content and subject of any registered transactional email — without touching code or redeploying the application. It is powered by the `spatie/laravel-database-mail-templates` package.

## Architecture

### Database Schema

Templates are stored in the `mail_templates` table (migrated via the package's published migration):

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Auto-increment primary key |
| `mailable` | string | Fully qualified Mailable class name |
| `subject` | string | Email subject (supports `{{ variables }}`) |
| `html_template` | text | HTML email body (supports `{{ variables }}`) |
| `text_template` | text (nullable) | Plain-text fallback body |

### Mailable Integration

Any transactional Mailable that should be database-driven extends `Spatie\MailTemplates\TemplateMailable` instead of `Illuminate\Mail\Mailable`.

**Example** — `App\Mail\WorkspaceInvitation`:

```php
class WorkspaceInvitation extends TemplateMailable
{
    public string $workspaceName;
    public string $inviterName;
    public string $acceptUrl;
    public string $role;

    public function __construct(WorkspaceInvitationModel $invitation)
    {
        $this->workspaceName = $invitation->workspace->name;
        $this->inviterName   = $invitation->workspace->owner->name;
        $this->acceptUrl     = route('invitations.show', $invitation->token);
        $this->role          = ucfirst($invitation->role);
    }
}
```

Public properties on the Mailable become `{{ variables }}` in the template body.

### Template Variables

Variables are extracted automatically when editing — any `{{ variable }}` found in `html_template`, `text_template`, or `subject` is listed as an available binding in the edit UI sidebar.

### Notification Integration

`TeamInvitationNotification` delegates to the `WorkspaceInvitation` Mailable so that all workspace invitation emails are dynamically controlled:

```php
public function toMail($notifiable): WorkspaceInvitation
{
    return (new WorkspaceInvitation($this->invitation))
        ->to($notifiable->email);
}
```

## Admin Panel UI

Available at `/admin/mail-templates` (Super Admin only).

| Page | Route | Description |
|------|-------|-------------|
| Index | `GET /admin/mail-templates` | Paginated table of all registered templates |
| Edit | `GET /admin/mail-templates/{id}/edit` | Edit subject, HTML, and text body |
| Update | `PUT /admin/mail-templates/{id}` | Save changes to the database |

### Authorization

All routes are protected by the `superadmin` middleware — only users with `is_superadmin = true` may access them.

## Seeding Default Templates

The `EmailTemplateSeeder` seeds the initial templates on fresh installation:

```bash
php artisan db:seed --class=EmailTemplateSeeder
```

Or via `php artisan migrate:fresh --seed` (automatically invoked by `DatabaseSeeder`).

## Adding New Mailable Templates

1. Extend `TemplateMailable` on your Mailable.
2. Declare public properties as `{{ variables }}`.
3. Add a seed entry in `EmailTemplateSeeder` via `MailTemplate::firstOrCreate(...)`.
4. Re-seed or create the database record manually via the Admin UI.
