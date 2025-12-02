<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierWebhookController;
use Symfony\Component\HttpFoundation\Response;

class StripeWebhookController extends CashierWebhookController
{
    /**
     * Handle customer subscription created.
     *
     * This is called when a new subscription is created via Checkout.
     */
    protected function handleCustomerSubscriptionCreated(array $payload): Response
    {
        // Let Cashier handle the subscription creation first
        $response = parent::handleCustomerSubscriptionCreated($payload);

        // Then add our custom logic
        $data = $payload['data']['object'];
        $workspace = $this->findBillable($data['customer']);

        if ($workspace instanceof Workspace) {
            // Refresh to get the latest subscription data
            $workspace->refresh();

            Log::info('Subscription created for workspace', [
                'workspace_id' => $workspace->id,
                'workspace_name' => $workspace->name,
                'plan' => $workspace->plan_name,
                'stripe_subscription_id' => $data['id'],
                'stripe_price' => $data['items']['data'][0]['price']['id'] ?? 'unknown',
            ]);

            // You can add custom logic here:
            // - Send welcome email
            // - Trigger onboarding flow
            // - Update analytics
        }

        return $response;
    }

    /**
     * Handle customer subscription updated.
     *
     * This is called when a subscription is upgraded/downgraded.
     */
    protected function handleCustomerSubscriptionUpdated(array $payload): Response
    {
        $response = parent::handleCustomerSubscriptionUpdated($payload);

        $data = $payload['data']['object'];
        $workspace = $this->findBillable($data['customer']);

        if ($workspace instanceof Workspace) {
            $workspace->refresh();

            Log::info('Subscription updated for workspace', [
                'workspace_id' => $workspace->id,
                'workspace_name' => $workspace->name,
                'new_plan' => $workspace->plan_name,
                'status' => $data['status'],
            ]);

            // You can add custom logic here:
            // - Send plan change confirmation email
            // - Adjust feature access
        }

        return $response;
    }

    /**
     * Handle customer subscription deleted.
     *
     * This is called when a subscription is cancelled.
     */
    protected function handleCustomerSubscriptionDeleted(array $payload): Response
    {
        $data = $payload['data']['object'];
        $workspace = $this->findBillable($data['customer']);

        if ($workspace instanceof Workspace) {
            Log::info('Subscription cancelled for workspace', [
                'workspace_id' => $workspace->id,
                'workspace_name' => $workspace->name,
            ]);

            // You can add custom logic here:
            // - Send cancellation confirmation
            // - Offer win-back incentive
            // - Export data reminder
        }

        return parent::handleCustomerSubscriptionDeleted($payload);
    }

    /**
     * Find the billable model (Workspace) for the given customer ID.
     */
    protected function findBillable($stripeId)
    {
        return Workspace::where('stripe_id', $stripeId)->first();
    }
}
