# Localization Management

This application includes a built-in Localization Management UI for super-admins, allowing direct modification of translation strings from the web interface.

## Accessing the Tool

1. Log in as a user with the `superadmin` role.
2. Navigate to the Admin Panel (`/admin/dashboard`).
3. Click on the **Translations** link in the sidebar menu.

## How it Works

The Localization Management tool works by directly reading and writing to the JSON translation files located in the `lang/` directory of your Laravel application.

It uses `en.json` (English) as the base locale for presenting comparison strings.

### Features

- **Create New Locales:** Add new language support instantly by providing a 2-letter ISO code (e.g. `fr`, `es`).
- **Inline Editing:** Instantly modify translations and save changes per key.
- **Real-time Search:** Filter the massive list of keys and translations using the search bar.
- **Dirty State Tracking:** Input fields highlight when they have unsaved changes.

## Development

- **Controller:** `App\Http\Controllers\Admin\TranslationController`
- **Frontend View:** `resources/js/pages/admin/translations.tsx`
- **Routes:** Grouped under `routes/web.php` with the `admin.` prefix and `[auth, superadmin]` middleware.

## Adding Backend Strings

When adding new content to your application, standard Laravel translation methods (`__()`) should be used. The Localization UI will automatically recognize the new strings when the base `en.json` file is populated with them (or when users add new keys manually).
