# Workspace Custom Branding

## Overview

Workspace admins can customize their workspace with an accent color. The color picker includes preset swatches and a live preview.

## Schema Change

Added `accent_color` (varchar 7, nullable) to the `workspaces` table. Stores hex color codes like `#6366f1`.

## Validation

Hex color format enforced via regex: `/^#[0-9A-Fa-f]{6}$/`

## Frontend

The workspace settings page (`resources/js/Pages/workspaces/settings.tsx`) includes a **Branding** card with:

- Native HTML color picker
- Hex code text input
- 10 preset color swatches (indigo, violet, pink, red, orange, yellow, green, cyan, blue, slate)
- Live preview showing the workspace name in the selected color
- Reset button to clear the accent color

## Integration Points

The `accent_color` is available in the workspace data passed to Inertia. Frontend components can use it to style elements dynamically via inline styles or CSS custom properties.

## Authorization

Only workspace admins and owners can update branding settings.
