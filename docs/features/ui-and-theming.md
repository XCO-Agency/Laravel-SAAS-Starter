# UI & Theming

## Overview

The starter kit utilizes the bleeding edge of frontend aesthetics, combining **Tailwind CSS v4** with a dark-mode compliant **React 19** implementation of **shadcn/ui**.

## Core Features

1. **Dark & Light Modes:** Fully integrated, flashless dark mode based on the user's OS preference or manual system override.
2. **Beautiful Defaults:** Dozens of pre-built, highly accessible components (Buttons, Dropdowns, Dialogs, Inputs) directly in the `/resources/js/components/ui` folder.
3. **CSS Variables:** Theming relies entirely on raw CSS variables (`hsl()`) enabling massive application-wide color palette shifts by modifying a few lines of CSS.

## Technical Implementation

- **Tailwind CSS v4:** Driven natively without a `tailwind.config.js`. Instead, theme variables, core plugins, and extensions are declared centrally inside `resources/css/app.css` using the new `@theme` block.
- **HandleAppearance Middleware:** The application remembers the user's cosmetic preference in their encrypted session cookies via `HandleAppearance.php`, avoiding layout flash upon deep linking.
- **Shadcn UI Extensibility:** Unlike NPM libraries, Shadcn UI components are physical code structures in your repository. You natively possess the source code for the `DropdownMenu`, the `Input`, the `Tooltip`, and more.

## Modifying the Primary Brand Color

To alter the primary accent color of the application away from the default black/white contrast:
Locate `resources/css/app.css` and adjust the `--primary` variable under both `:root` and `.dark` scopes:

```css
@theme {
  --color-primary: var(--primary);
  /* ... */
}

:root {
  --primary: 221.2 83.2% 53.3%; /* A blue shade */
}
.dark {
  --primary: 217.2 91.2% 59.8%;
}
```
