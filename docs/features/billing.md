# Billing & Subscriptions

## Overview

Billing is tightly integrated at the **Workspace** level (not the User level). Every workspace must maintain its own active subscription to access premium features. The integration is powered by **Laravel Cashier (Stripe)**.

## Core Features

- **Pricing Tiers**: Multiple plans (e.g., Basic, Pro, Enterprise) configurable via Stripe.
- **Checkout Flow**: Seamless Stripe Checkout integration for new subscriptions.
- **Billing Portal**: Secure, Stripe-hosted customer portal for updating payment methods, downloading past invoices, and canceling subscriptions.
- **Trial Periods**: Optional free trials before a card is charged.
- **Grace Periods**: If a subscription is canceled, the workspace retains access until the end of their current billing cycle.

## Technical Implementation

- **Backend Model:** The `Workspace` model uses the `Laravel\Cashier\Billable` trait. Cashier has been configured in `AppServiceProvider` to use `Workspace::class` as the customer model instead of `User::class`.
- **Database Tables:** Cashier migrations install `subscriptions` and `subscription_items` tables linked to the `workspaces` table via Stripe IDs.
- **Webhooks:** Stripe webhooks (`/stripe/webhook`) automatically keep local database subscription statuses synchronized with Stripe.
- **Frontend:** Billing plans and current subscription status are displayed on the `settings/billing` and `settings/workspace/plans` pages.

## Billing Gates & Access Control

When users attempt to access premium features, the application checks if their active workspace has a valid subscription using Cashier's `$workspace->subscribed()` methods. If not, they are redirected to a plan selection page or an upgrade wall.
