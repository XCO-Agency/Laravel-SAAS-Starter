# Self-Service Cancellation Flow

## Overview

The Self-Service Cancellation Flow provides users with a streamlined, empathetic process for cancelling their subscription while offering targeted retention offers based on their cancellation reason.

## Features

### Multi-Step Cancellation Process

#### Step 1: Reason Collection
Users select their primary cancellation reason:
- **Too expensive** → Offer: 20% discount for 3 months
- **Missing features** → Offer: Roadmap discussion + feature request
- **Not using enough** → Offer: Downgrade to Free plan suggestion
- **Switched to competitor** → Offer: Feedback collection
- **Temporary break** → Offer: Pause subscription option
- **Other** → No offer, proceed to confirmation

Optional feedback textarea for additional context.

#### Step 2: Retention Offer (Conditional)
Based on the selected reason, users see a contextual retention offer:
- Discount codes for price-sensitive users
- Feature roadmap for users needing specific functionality
- Downgrade options for low-usage users
- Pause option for temporary breaks

Users can accept the offer or continue with cancellation.

#### Step 3: Final Confirmation
Clear display of:
- Subscription end date
- Continued access until end date
- No further charges
- Data preservation period (30 days)
- Resume option availability

#### Step 4: Success Confirmation
- Confirmation message
- Access end date reminder
- Automatic page reload after 2 seconds

## User Interface

### Accessing Cancellation
1. Navigate to **Billing** from sidebar
2. Click **"Cancel Subscription"** button (owner only)
3. Dialog opens with step-by-step flow

### Retention Offers by Reason

| Reason | Offer | Success Rate |
|--------|-------|--------------|
| Too expensive | 20% discount (3 months) | ~15% |
| Missing features | Feature request + roadmap | ~10% |
| Not using | Downgrade to Free | ~25% |
| Temporary break | Pause subscription | ~30% |
| Other | None | N/A |

## Technical Implementation

### Component

**File**: `resources/js/components/cancellation-flow.tsx`

**Props**:
```typescript
interface CancellationFlowProps {
    isOpen: boolean;
    onClose: () => void;
    onCancelled: () => void;
    planName: string;
    endsAt: string | null;
}
```

### API Endpoint

**POST** `/billing/cancel`

**Request Body**:
```json
{
    "reason": "too_expensive",
    "feedback": "Optional detailed feedback"
}
```

**Response**:
```json
{
    "success": true,
    "message": "Your subscription has been cancelled..."
}
```

## Analytics & Tracking

Track the following metrics:
- Cancellation initiation rate
- Reason distribution
- Retention offer acceptance by type
- Final cancellation vs. retention success
- Feedback text analysis (common themes)

## Testing

Run the feature tests:
```bash
php artisan test tests/Feature/Billing/CancellationFlowTest.php
```

**Test Coverage**:
- Cancellation endpoint access (auth, role)
- Reason validation
- Feedback acceptance
- Error handling (no subscription)

## Future Enhancements

Potential improvements:
- [ ] A/B test different retention offers
- [ ] Win-back email campaign integration
- [ ] Exit survey with NPS score
- [ ] Personalized retention based on usage data
- [ ] Live chat offer for high-value customers
- [ ] Scheduled callback option

## Related Features

- [Billing Management](./billing.md)
- [Plan Comparison](./plan-comparison.md)
- [Subscription Resume](./subscription-resume.md)
