<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Http\Controllers\WebhookController;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class BillingController extends Controller
{
    /**
     * Display the billing overview page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        $subscription = $workspace->subscription('default');
        $invoices = $workspace->invoices()->take(10);

        return Inertia::render('Billing/index', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'plan' => $workspace->plan_name,
                'on_trial' => $workspace->onTrial('default'),
                'trial_ends_at' => $subscription?->trial_ends_at,
                'seat_count' => $workspace->activeSeatCount(),
                'seat_limit' => $workspace->seatLimit(),
            ],
            'subscription' => $subscription ? [
                'status' => $subscription->stripe_status,
                'ends_at' => $subscription->ends_at,
                'on_grace_period' => $subscription->onGracePeriod(),
                'cancelled' => $subscription->canceled(),
            ] : null,
            'invoices' => $invoices->map(fn ($invoice) => [
                'id' => $invoice->id,
                'date' => $invoice->date()->format('F j, Y'),
                'total' => $invoice->total(),
                'pdf_url' => $invoice->asStripeInvoice()->invoice_pdf ?? null,
            ])->filter(fn ($invoice) => $invoice['pdf_url'] !== null)->values(),
            'plans' => $this->getPlansForDisplay(),
            'userRole' => $workspace->getUserRole($user),
        ]);
    }

    /**
     * Display available plans.
     */
    public function plans(Request $request): Response
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        return Inertia::render('Billing/plans', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'plan' => $workspace->plan_name,
            ],
            'plans' => $this->getPlansForDisplay(),
            'currentPlan' => $workspace->plan_key,
            'currentBillingPeriod' => $workspace->billing_period,
            'userRole' => $workspace->getUserRole($user),
        ]);
    }

    /**
     * Subscribe the workspace to a plan.
     */
    public function subscribe(Request $request): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'string', 'in:pro,business'],
            'billing_period' => ['required', 'string', 'in:monthly,yearly'],
        ]);

        $user = $request->user();
        $workspace = $user->currentWorkspace;
        Gate::authorize('manageBilling', $workspace);

        $plans = config('billing.plans');

        $plan = $plans[$validated['plan']] ?? null;
        if (! $plan) {
            return response()->json(['error' => 'Invalid plan selected.'], 400);
        }

        $priceId = $plan['stripe_price_id'][$validated['billing_period']] ?? null;
        if (! $priceId) {
            return response()->json(['error' => 'Invalid billing period.'], 400);
        }

        // Check if already on this exact plan and billing period
        $subscription = $workspace->subscription('default');
        if ($subscription && $subscription->stripe_price === $priceId) {
            return response()->json([
                'success' => true,
                'message' => 'You are already on this plan.',
            ]);
        }

        // If already subscribed (active or trialing), swap to new price
        if ($workspace->subscribed('default') || $workspace->onTrial('default')) {
            try {
                $workspace->subscription('default')->swap($priceId);

                return response()->json([
                    'success' => true,
                    'message' => 'Your subscription has been updated.',
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to update subscription: '.$e->getMessage(),
                ], 500);
            }
        }

        // No existing subscription - create checkout session
        try {
            $checkout = $workspace->newSubscription('default', $priceId)
                ->trialDays(config('billing.trial_days', 0))
                ->checkout([
                    'success_url' => route('billing.index').'?checkout=success',
                    'cancel_url' => route('billing.plans').'?checkout=cancelled',
                ]);

            return response()->json(['checkout_url' => $checkout->url]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to create checkout: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Redirect to Stripe Customer Portal.
     */
    public function portal(Request $request): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $workspace = $request->user()->currentWorkspace;
        Gate::authorize('manageBilling', $workspace);

        if (! $workspace->hasStripeId()) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'No billing account found. Please subscribe to a plan first.'], 400);
            }

            return redirect()->back()
                ->with('error', 'No billing account found. Please subscribe to a plan first.');
        }

        $portalUrl = $workspace->billingPortalUrl(route('billing.index'));

        // Return URL for frontend to redirect (avoids CORS issues)
        if ($request->wantsJson()) {
            return response()->json(['portal_url' => $portalUrl]);
        }

        return redirect($portalUrl);
    }

    /**
     * Cancel the workspace subscription (downgrade to free).
     */
    public function cancel(Request $request): \Illuminate\Http\JsonResponse
    {
        $workspace = $request->user()->currentWorkspace;
        Gate::authorize('manageBilling', $workspace);

        if (! $workspace->subscribed('default')) {
            return response()->json([
                'success' => false,
                'error' => 'No active subscription to cancel.',
            ], 400);
        }

        try {
            // Cancel at end of billing period (grace period)
            $workspace->subscription('default')->cancel();

            return response()->json([
                'success' => true,
                'message' => 'Your subscription has been cancelled. You will have access until the end of your billing period.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to cancel subscription: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resume a cancelled subscription during grace period.
     */
    public function resume(Request $request): \Illuminate\Http\JsonResponse
    {
        $workspace = $request->user()->currentWorkspace;
        Gate::authorize('manageBilling', $workspace);

        $subscription = $workspace->subscription('default');

        if (! $subscription || ! $subscription->onGracePeriod()) {
            return response()->json([
                'success' => false,
                'error' => 'No subscription to resume.',
            ], 400);
        }

        try {
            $subscription->resume();

            return response()->json([
                'success' => true,
                'message' => 'Your subscription has been resumed.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to resume subscription: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Stripe webhooks.
     */
    public function webhook(Request $request): SymfonyResponse
    {
        // Use Laravel Cashier's webhook controller
        $controller = new WebhookController;

        return $controller->handleWebhook($request);
    }

    /**
     * Get plans formatted for frontend display.
     */
    protected function getPlansForDisplay(): array
    {
        $plans = config('billing.plans');

        return collect($plans)->map(function ($plan, $key) {
            return [
                'id' => $key,
                'name' => $plan['name'],
                'description' => $plan['description'],
                'price' => $plan['price'],
                'features' => $plan['features'],
                'limits' => $plan['limits'],
                'popular' => $plan['popular'] ?? false,
            ];
        })->values()->all();
    }
}
