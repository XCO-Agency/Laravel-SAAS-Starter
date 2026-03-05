# Onboarding Wizard

## Overview

Newly registered users complete a guided onboarding wizard before accessing the full app. The wizard now includes an explicit optional billing preference step to improve plan conversion flow.

## Flow

1. Welcome step
2. Workspace naming step
3. Optional billing preference step

Users can choose:

- `Free` (continue directly to dashboard), or
- `Pro` / `Business` with `Monthly` or `Yearly` billing preference

## Billing Preference Behavior

When a paid plan is selected during onboarding:

- The workspace is still created immediately.
- The user is marked onboarded.
- The user is redirected to billing plans with recommendation query params:
  - `onboarding=1`
  - `recommended_plan`
  - `recommended_billing_period`

The billing plans page reads these values to preselect period and show contextual guidance.

## Validation

`OnboardingController@store` validates:

- `workspace_name` (required)
- `onboarding_plan` (`free|pro|business`, optional)
- `onboarding_billing_period` (`monthly|yearly`, optional)

## Tests

Run targeted tests:

```bash
php artisan test --compact tests/Feature/OnboardingTest.php tests/Feature/Billing/BillingTest.php
```

Coverage includes:

- standard onboarding workspace creation
- paid-intent redirect to billing plans
- billing plans recommendation props mapping
