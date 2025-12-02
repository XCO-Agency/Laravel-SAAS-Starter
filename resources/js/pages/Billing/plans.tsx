import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Plan, type WorkspaceRole } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface PlansPageProps {
    plans: Plan[];
    currentPlan: string;
    currentBillingPeriod: 'monthly' | 'yearly' | null;
    userRole: WorkspaceRole;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/billing' },
    { title: 'Plans', href: '/billing/plans' },
];

export default function PlansPage({ plans, currentPlan, currentBillingPeriod, userRole }: PlansPageProps) {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(currentBillingPeriod || 'monthly');
    const [processing, setProcessing] = useState<string | null>(null);
    const isOwner = userRole === 'owner';

    // Check if this is the exact current plan (same plan AND same billing period)
    const isExactCurrentPlan = (plan: Plan) => {
        if (plan.id === 'free') {
            return currentPlan === 'free';
        }
        return plan.id === currentPlan && billingPeriod === currentBillingPeriod;
    };

    // Check if user is on this plan (regardless of billing period)
    const isOnThisPlan = (plan: Plan) => plan.id === currentPlan;

    const handleSubscribe = async (planId: string) => {
        if (!isOwner) return;

        setProcessing(planId);

        try {
            const response = await fetch('/billing/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    plan: planId,
                    billing_period: billingPeriod,
                }),
            });

            const data = await response.json();

            if (data.checkout_url) {
                // Full browser redirect to Stripe Checkout
                window.location.href = data.checkout_url;
            } else if (data.success) {
                // Plan swap successful, redirect to billing page
                router.visit('/billing');
            } else if (data.error) {
                alert(data.error);
                setProcessing(null);
            } else {
                // Fallback: reload the page
                router.visit('/billing');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setProcessing(null);
        }
    };

    const handleCancelSubscription = async () => {
        if (!isOwner) return;
        if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
            return;
        }

        setProcessing('free');

        try {
            const response = await fetch('/billing/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                router.visit('/billing');
            } else {
                alert(data.error || 'Failed to cancel subscription');
                setProcessing(null);
            }
        } catch (error) {
            console.error('Cancel error:', error);
            setProcessing(null);
        }
    };

    const getButtonText = (plan: Plan) => {
        if (plan.id === 'free') {
            return currentPlan === 'free' ? 'Current Plan' : 'Downgrade to Free';
        }
        
        // Exact match: same plan AND same billing period
        if (isExactCurrentPlan(plan)) {
            return 'Current Plan';
        }
        
        // Same plan but different billing period
        if (isOnThisPlan(plan)) {
            return billingPeriod === 'yearly' ? 'Switch to Yearly' : 'Switch to Monthly';
        }
        
        // Different plan
        if (currentPlan === 'free') {
            return 'Upgrade';
        }
        if (currentPlan === 'pro' && plan.id === 'business') {
            return 'Upgrade';
        }
        if (currentPlan === 'business' && plan.id === 'pro') {
            return 'Downgrade';
        }
        
        return 'Switch Plan';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pricing Plans" />

            <div className="space-y-6">
                <Heading
                    title="Pricing Plans"
                    description="Choose the plan that best fits your needs."
                />

                {/* Billing Period Toggle */}
                <div className="flex items-center justify-center gap-4">
                    <Label
                        htmlFor="billing-monthly"
                        className={`cursor-pointer ${billingPeriod === 'monthly' ? 'font-medium' : 'text-muted-foreground'}`}
                    >
                        Monthly
                    </Label>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={billingPeriod === 'yearly'}
                        onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            billingPeriod === 'yearly' ? 'bg-primary' : 'bg-input'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 rounded-full bg-background transition-transform ${
                                billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                    <Label
                        htmlFor="billing-yearly"
                        className={`cursor-pointer ${billingPeriod === 'yearly' ? 'font-medium' : 'text-muted-foreground'}`}
                    >
                        Yearly
                        <Badge variant="secondary" className="ml-2">
                            Save 17%
                        </Badge>
                    </Label>
                </div>

                {/* Plans Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col ${
                                isExactCurrentPlan(plan)
                                    ? 'border-primary shadow-lg ring-2 ring-primary'
                                    : plan.popular
                                    ? 'border-primary shadow-lg'
                                    : ''
                            }`}
                        >
                            {isExactCurrentPlan(plan) ? (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge variant="default" className="gap-1 bg-green-600">
                                        <Check className="h-3 w-3" />
                                        Your Plan
                                    </Badge>
                                </div>
                            ) : plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        Most Popular
                                    </Badge>
                                </div>
                            )}
                            <CardHeader className="text-center">
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">
                                        ${billingPeriod === 'monthly'
                                            ? plan.price.monthly
                                            : plan.price.yearly}
                                    </span>
                                    <span className="text-muted-foreground">
                                        /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                {plan.id === 'free' ? (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        disabled={currentPlan === 'free' || !isOwner || processing !== null}
                                        onClick={handleCancelSubscription}
                                    >
                                        {processing === 'free' && <Spinner className="mr-2" />}
                                        {getButtonText(plan)}
                                    </Button>
                                ) : (
                                    <Button
                                        variant={isExactCurrentPlan(plan) ? 'secondary' : plan.popular ? 'default' : 'outline'}
                                        className="w-full"
                                        disabled={isExactCurrentPlan(plan) || !isOwner || processing !== null}
                                        onClick={() => handleSubscribe(plan.id)}
                                    >
                                        {processing === plan.id && <Spinner className="mr-2" />}
                                        {getButtonText(plan)}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* FAQ or Additional Info */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-medium">Can I change plans later?</h4>
                            <p className="text-sm text-muted-foreground">
                                Yes, you can upgrade or downgrade your plan at any time. Changes take
                                effect immediately and are prorated.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium">What payment methods do you accept?</h4>
                            <p className="text-sm text-muted-foreground">
                                We accept all major credit cards (Visa, MasterCard, American Express)
                                through our secure payment processor, Stripe.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium">Can I cancel my subscription?</h4>
                            <p className="text-sm text-muted-foreground">
                                Yes, you can cancel your subscription at any time. You&apos;ll continue
                                to have access to paid features until the end of your billing period.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {!isOwner && (
                    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50">
                        <CardContent className="py-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Only the workspace owner can manage billing and subscriptions.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

