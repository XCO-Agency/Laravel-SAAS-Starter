# Plan Comparison Feature

## Overview

The Plan Comparison feature provides a comprehensive side-by-side comparison of all available subscription plans, helping users make informed decisions about which plan best fits their needs.

## Features

### Side-by-Side Comparison Table
- **Plan Overview**: Displays all plans (Free, Pro, Business) with pricing
- **Feature Matrix**: Shows which features are included in each plan
- **Limit Comparison**: Compares team member limits, workspace limits, and storage
- **Visual Indicators**: Checkmarks for included features, dashes for excluded ones

### Billing Period Toggle
- Switch between **Monthly** and **Yearly** billing
- Shows 20% savings badge for yearly billing
- Real-time price updates when toggling

### Current Plan Highlighting
- Current plan is clearly marked with a "Current Plan" badge
- Prevents accidental re-subscription to same plan
- Shows "Switch" or "Upgrade" buttons appropriately

### FAQ Section
Common questions answered:
- Can I change plans anytime?
- What happens if I exceed my limits?
- Is there a free trial?
- What payment methods are accepted?

## User Interface

### Accessing the Comparison Page
1. Navigate to **Billing** from the sidebar
2. Click **"Compare Plans"** button in the Current Plan card
3. Or navigate directly to `/billing/compare`

### Using the Comparison Table
- **Toggle Billing Period**: Use the monthly/yearly toggle at the top
- **Review Features**: Scroll through the feature matrix to see what's included
- **Compare Limits**: Review team members, workspaces, and storage limits
- **Select Plan**: Click the action button for your desired plan

## Technical Implementation

### Backend

**Route**: `GET /billing/compare`

**Controller**: `BillingController@compare`

**Data Provided**:
```php
[
    'plans' => [...], // All plans with features, limits, pricing
    'currentPlan' => 'pro', // Current workspace plan
    'userRole' => 'owner', // User's role in workspace
]
```

### Frontend

**Component**: `resources/js/pages/billing/compare.tsx`

**Key Features**:
- Responsive table layout (horizontal scroll on mobile)
- Interactive billing period toggle
- Tooltip explanations for features
- Loading states for subscription actions

## Testing

Run the feature tests:
```bash
php artisan test tests/Feature/Billing/PlanComparisonTest.php
```

**Test Coverage**:
- Page display for all user roles
- Correct identification of current plan
- Plan data structure validation
- Authentication requirements

## Future Enhancements

Potential improvements:
- [ ] Feature category grouping (e.g., "Security", "Collaboration")
- [ ] Interactive feature tooltips with screenshots
- [ ] Plan recommendation quiz
- [ ] Usage-based plan suggestions
- [ ] Custom plan builder for enterprise

## Related Features

- [Billing Management](./billing.md)
- [Plan Selection](./plan-selection.md)
- [Subscription Management](./subscription-management.md)
