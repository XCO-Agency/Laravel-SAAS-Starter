# Internationalization (i18n)

## Overview

The SaaS starter kit encompasses full **Internationalization (i18n)** support out-of-the-box, allowing you to seamlessly translate your React frontend into multiple languages. It also inherently supports Right-to-Left (RTL) locales like Arabic.

## Core Features

1. **Multiple Languages:** Ships by default with English (`en`), Spanish (`es`), French (`fr`), and Arabic (`ar`).
2. **Translation Hook:** Provides a customized `useTranslations` React hook that safely accesses localized strings with fallback logic.
3. **Locale State Management:** Locales are explicitly managed by the `SetLocale` backend middleware, which captures the user's preference or session, passing it to Inertia `$page.props.locale`.
4. **RTL Support:** Employs dynamic HTML `dir` attribute swapping (e.g., `dir="rtl"`) based on the active language, combined with Tailwind CSS logical properties.

## Technical Implementation

- **Translation Files:** Stored as massive JSON dictionaries located natively in `/resources/js/locales/{lang}.json`.
- **Backend Middleware:** `App\Http\Middleware\SetLocale` reads the session `locale` (if set) or heavily relies on the application boundary `config('app.locale')`.
- **Frontend Hook:** Defined in `resources/js/hooks/use-translations.ts`, exposing the signature `const { t } = useTranslations()`.

**Usage Example:**

```tsx
import { useTranslations } from '@/hooks/use-translations';

export default function MyComponent() {
    const { t } = useTranslations();
    
    return (
        <h1>{t('dashboard.greeting', 'Welcome back, User!')}</h1>
    );
}
```

## Adding a New Language

1. Create a new file (e.g., `de.json`) in `/resources/js/locales/`.
2. Populate the required translation keys.
3. Update the frontend language switcher component to include the new locale option.
