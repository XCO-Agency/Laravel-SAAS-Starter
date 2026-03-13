# Workspace Email Domain Restriction

Workspace owners can restrict membership to specific email domains (e.g. only `@acme.com` addresses). Invitations and invite-link joins are blocked for users whose email does not match an allowed domain.

## How It Works

1. A workspace owner enters one or more domains (comma-separated) on the **Workspace Security** settings page.
2. Domains are stored as a JSON array in the `workspaces.allowed_email_domains` column.
3. When a user tries to accept an invitation or join via an invite link, `Workspace::isEmailDomainAllowed()` is called.
4. If the user's email domain is not in the allowlist, the action is blocked with an error message.
5. Leaving the field empty removes all restrictions.

## Database

| Column | Type | Default |
|--------|------|---------|
| `allowed_email_domains` | `json` (nullable) | `null` |

Migration: `database/migrations/2026_03_12_231408_add_allowed_email_domains_to_workspaces_table.php`

## Key Files

| File | Role |
|------|------|
| `app/Models/Workspace.php` | `isEmailDomainAllowed()` helper + cast |
| `app/Http/Controllers/Settings/WorkspaceSecurityController.php` | Save & display settings |
| `app/Services/InvitationService.php` | Domain check on invitation acceptance |
| `app/Http/Controllers/WorkspaceInviteLinkController.php` | Domain check on invite-link join |
| `resources/js/pages/settings/workspace-security.tsx` | Email Domain Restriction card in UI |

## Enforcement Logic

```php
// Workspace model
public function isEmailDomainAllowed(string $email): bool
{
    if (empty($this->allowed_email_domains)) {
        return true; // no restriction
    }
    $domain = strtolower(Str::after($email, '@'));
    return in_array($domain, array_map('strtolower', $this->allowed_email_domains));
}
```

The check is case-insensitive. Multiple domains use OR logic — a user only needs to match one.

## Demo Data

The **Acme Corporation** demo workspace is seeded with `allowed_email_domains: ['acme.com', 'acmecorp.com']`.

## Testing

Test file: `tests/Feature/Settings/WorkspaceDomainRestrictionTest.php`

- Owner can save domain restrictions
- Non-owner is forbidden from updating settings
- Invalid domain format fails validation
- Clearing the field removes restrictions
- `isEmailDomainAllowed()` unit coverage (no restriction, match, no match, multiple domains)
- Invitation acceptance blocked for non-allowed domain
- Invite-link join blocked for non-allowed domain

Run: `php artisan test --compact tests/Feature/Settings/WorkspaceDomainRestrictionTest.php`
