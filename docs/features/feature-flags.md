# Feature Flags (Laravel Pennant)

## Overview

The platform supports a high-performance **Feature Flagging** system powered natively by **Laravel Pennant**. Flags can be rolled out globally across all organizations or selectively enabled for specific Workspaces, allowing iterative development and beta testing.

## Core Features

- **Database-Driven Definitions:** Flags are defined dynamically directly from an admin-controlled `feature_flags` database table, giving administrators total non-technical control.
- **Global vs Targeted:** Flags can be marked "global" to immediately affect all workspaces, or targeted strictly to an array of specific workspace IDs.
- **Robust Admin Management:** Beautiful UI for Super Admins to manage standard feature flags, with intuitive workspace selection inputs to define the target array.
- **Performant Caching:** Integrated seamlessly with Laravel's Cache to ensure massive read-heavy feature evaluations do not repeatedly hit the database.

## Technical Implementation

- **Pennant Core:** Uses `Laravel\Pennant\Feature` and `Laravel\Pennant\Concerns\HasFeatures` traits. The `Workspace` model leverages `HasFeatures` rather than relying uniquely on user-level scoping.
- **Dynamic Definition UI:** Inside `AppServiceProvider::boot()`, standard database metadata (`FeatureFlag::all()`) is mapped gracefully into `Feature::define()`.
- **Cache Invalidation:** The `FeatureFlag` eloquent model automatically hooks to `saved()` and `deleted()` events to purge Pennant cache state and re-register changes instantly across the global application cache.
- **Inertia Propogation:** Features are resolved natively via `Feature::for($currentWorkspace)->all()` inside `HandleInertiaRequests`, injecting all active feature strings as booleans directly into `$page.props.currentWorkspace.feature_flags`.

## Usage in Views (Frontend)

Because flags are actively pushed to the current workspace prop, evaluating flag state in React is simple:

```javascript
const { currentWorkspace } = usePage<PageProps>().props;
const hasAiAssistant = currentWorkspace?.feature_flags['ai-assistant'] === true;

if (hasAiAssistant) {
    return <BetaAiAssistant />;
}
```
