# Seat-Based Billing

Seat-based billing enforces per-plan team member limits and optionally syncs the Stripe subscription quantity when members join or leave.

## Architecture

Seat limits are defined in `config/billing.php` and enforced at the `InvitationService` level. The `Workspace` model exposes helper methods consumed across the application.

## Plan Seat Limits

| Plan     | Seat Limit     |
|----------|---------------|
| Free     | 2             |
| Pro      | 10            |
| Business | Unlimited (−1)|

These are configured in `config/billing.php` under `plans.{plan}.limits.team_members`. Use `-1` to indicate unlimited.

## Workspace Model Helpers

Four methods added to `App\Models\Workspace`:

```php
// Maximum seats for the current plan (-1 = unlimited)
public function seatLimit(): int

// Current number of confirmed workspace members
public function activeSeatCount(): int

// True if at least one seat is still available
public function hasAvailableSeat(): bool

// Syncs Stripe subscription quantity to activeSeatCount()
// No-op if workspace is not subscribed; fails silently
public function syncSubscriptionQuantity(): void
```

## Invitation Enforcement

`App\Services\InvitationService::canInvite(Workspace $workspace): bool` checks:

1. Returns `true` immediately for Business plan (unlimited)
2. Compares `currentMembers + pendingInvitations` against the plan limit
3. `TeamController::invite()` calls `canInvite()` before creating an invitation and returns a redirect with an `error` flash message if blocked

## Stripe Quantity Sync

When a member is removed via `TeamController::removeMember()`, after `$workspace->removeUser($user)`, the controller calls `$workspace->syncSubscriptionQuantity()`. This issues a Stripe API call via Cashier to update the subscription's `quantity` field, keeping billing records accurate. The call is wrapped in a try/catch and fails silently to prevent member removal from breaking on Stripe errors.

## Billing Page — Seat Meter

The billing index page (`resources/js/pages/Billing/index.tsx`) renders a **Seats** card between the Plan and Payment Method cards. The `BillingController::index()` passes `seat_count` and `seat_limit` in the workspace payload.

### Visual States

| Usage | Progress Bar Color | Extra UI |
|-------|--------------------|----------|
| < 80% | 🟢 Emerald | — |
| ≥ 80% | 🟡 Amber | — |
| 100%  | 🔴 Red (destructive) | Amber warning banner with upgrade CTA (owner only) |
| Unlimited | Hidden | "X members — unlimited seats" text |

## Key Files

| File | Role |
|------|------|
| `config/billing.php` | Per-plan `team_members` limit definition |
| `app/Models/Workspace.php` | `seatLimit()`, `activeSeatCount()`, `hasAvailableSeat()`, `syncSubscriptionQuantity()` |
| `app/Services/InvitationService.php` | `canInvite()` and `getMemberLimitMessage()` |
| `app/Http/Controllers/TeamController.php` | `invite()` blocks at limit; `removeMember()` syncs Stripe |
| `app/Http/Controllers/BillingController.php` | Passes `seat_count` and `seat_limit` to frontend |
| `resources/js/pages/Billing/index.tsx` | Seat meter card with progress bar |

## Tests

```bash
php artisan test --compact tests/Feature/Settings/SeatLimitTest.php
```

| Test | Coverage |
|------|----------|
| `activeSeatCount()` accuracy | Correct count after attach |
| Free plan seat limit | Returns 2 |
| `hasAvailableSeat()` under limit | True |
| `hasAvailableSeat()` at limit | False |
| Invite blocked at limit | Redirect + session error |
| Invite allowed under limit | Redirect, no error |

## Adding a New Plan Tier

1. Add the plan to `config/billing.php` with a `limits.team_members` value
2. Add the corresponding `stripe_price_id` values
3. Deploy and create the product/price in Stripe Dashboard
4. The seat limits and billing UI automatically reflect the new plan
