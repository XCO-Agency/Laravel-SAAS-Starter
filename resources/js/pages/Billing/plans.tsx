import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { useTranslations } from '@/hooks/use-translations';
import http from '@/lib/http';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type Plan, type WorkspaceRole } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface PlansPageProps {
    plans: Plan[];
    currentPlan: string;
    currentBillingPeriod: 'monthly' | 'yearly' | null;
    recommendedPlan: 'pro' | 'business' | null;
    recommendedBillingPeriod: 'monthly' | 'yearly' | null;
    fromOnboarding: boolean;
    userRole: WorkspaceRole;
}

export default function PlansPage({
    plans,
    currentPlan,
    currentBillingPeriod,
    recommendedPlan,
    recommendedBillingPeriod,
    fromOnboarding,
    userRole,
}: PlansPageProps) {
    const { t } = useTranslations();
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
        recommendedBillingPeriod || currentBillingPeriod || 'monthly',
    );
    const [processing, setProcessing] = useState<string | null>(null);
    const { addToast } = useToast();
    const isOwner = userRole === 'owner';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('billing.title', 'Billing'), href: '/billing' },
        { title: t('billing.plans.title', 'Plans'), href: '/billing/plans' },
    ];

    // Check if this is the exact current plan (same plan AND same billing period)
    const isExactCurrentPlan = (plan: Plan) => {
        if (plan.id === 'free') {
            return currentPlan === 'free';
        }
        return (
            plan.id === currentPlan && billingPeriod === currentBillingPeriod
        );
    };

    // Check if user is on this plan (regardless of billing period)
    const isOnThisPlan = (plan: Plan) => plan.id === currentPlan;

    const handleSubscribe = async (planId: string) => {
        if (!isOwner) return;

        setProcessing(planId);

        try {
            const { data } = await http.post<{ checkout_url?: string; success?: boolean; error?: string }>('/billing/subscribe', {
                body: { plan: planId, billing_period: billingPeriod },
            });

            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else if (data.success) {
                router.visit('/billing');
            } else if (data.error) {
                addToast(data.error, 'error');
                setProcessing(null);
            } else {
                router.visit('/billing');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setProcessing(null);
        }
    };

    const handleCancelSubscription = async () => {
        if (!isOwner) return;
        if (
            !confirm(
                'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
            )
        ) {
            return;
        }

        setProcessing('free');

        try {
            const { data } = await http.post<{ success?: boolean; error?: string }>('/billing/cancel');

            if (data.success) {
                router.visit('/billing');
            } else {
                addToast(
                    data.error || 'Failed to cancel subscription',
                    'error',
                );
                setProcessing(null);
            }
        } catch (error) {
            console.error('Cancel error:', error);
            setProcessing(null);
        }
    };

    const getButtonText = (plan: Plan) => {
        if (plan.id === 'free') {
            return currentPlan === 'free'
                ? t('billing.plans.current_plan', 'Current Plan')
                : t('billing.plans.downgrade_to_free', 'Downgrade to Free');
        }

        // Exact match: same plan AND same billing period
        if (isExactCurrentPlan(plan)) {
            return t('billing.plans.current_plan', 'Current Plan');
        }

        // Same plan but different billing period
        if (isOnThisPlan(plan)) {
            return billingPeriod === 'yearly'
                ? t('billing.plans.switch_to_yearly', 'Switch to Yearly')
                : t('billing.plans.switch_to_monthly', 'Switch to Monthly');
        }

        // Different plan
        if (currentPlan === 'free') {
            return t('billing.upgrade', 'Upgrade');
        }
        if (currentPlan === 'pro' && plan.id === 'business') {
            return t('billing.upgrade', 'Upgrade');
        }
        if (currentPlan === 'business' && plan.id === 'pro') {
            return t('billing.downgrade', 'Downgrade');
        }

        return t('billing.plans.change_billing_period', 'Switch Plan');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('billing.plans.title', 'Pricing Plans')} />

            <SettingsLayout
                title={t('billing.plans.title', 'Pricing Plans')}
                description={t('billing.plans.description', 'Choose the plan that best fits your needs.')}
                fullWidth
            >
                <div className="space-y-6">

                    {fromOnboarding && recommendedPlan && (
                        <Card className="border-primary/40 bg-primary/5">
                            <CardContent className="py-4">
                                <p className="text-sm text-muted-foreground">
                                    {t('billing.plans.onboarding_hint', 'You chose the {{plan}} plan during onboarding. Complete your subscription below or pick a different option.', {
                                        plan: recommendedPlan.charAt(0).toUpperCase() + recommendedPlan.slice(1),
                                    })}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Billing Period Toggle */}
                    <div className="flex items-center justify-center gap-4 animate-fade-in-up">
                        <Label
                            htmlFor="billing-monthly"
                            className={`cursor-pointer transition-colors duration-300 ${billingPeriod === 'monthly' ? 'font-bold text-foreground' : 'text-muted-foreground/60 hover:text-muted-foreground'}`}
                        >
                            {t('billing.plans.monthly', 'Monthly')}
                        </Label>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={billingPeriod === 'yearly'}
                            onClick={() =>
                                setBillingPeriod(
                                    billingPeriod === 'monthly'
                                        ? 'yearly'
                                        : 'monthly',
                                )
                            }
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-500 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none shadow-inner ${billingPeriod === 'yearly'
                                    ? 'bg-primary'
                                    : 'bg-input'
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 rounded-full bg-background shadow-md transition-transform duration-500 ease-in-out ${billingPeriod === 'yearly'
                                        ? 'translate-x-8'
                                        : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <Label
                            htmlFor="billing-yearly"
                            className={`cursor-pointer transition-colors duration-300 flex items-center gap-2 ${billingPeriod === 'yearly' ? 'font-bold text-foreground' : 'text-muted-foreground/60 hover:text-muted-foreground'}`}
                        >
                            Yearly
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold animate-pulse">
                                Save 17%
                            </Badge>
                        </Label>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto pb-12">
                        {plans.map((plan, index) => (
                            <Card
                                key={plan.id}
                                className={`glass relative flex flex-col transition-all duration-500 hover:scale-105 active:scale-95 animate-fade-in-up border-primary/20 hover:border-primary delay-${(index + 1) * 100} ${isExactCurrentPlan(plan)
                                        ? 'border-primary ring-2 ring-primary/20 shadow-2xl z-10'
                                        : recommendedPlan === plan.id
                                            ? 'border-primary/50 shadow-xl'
                                            : plan.popular
                                                ? 'border-primary/50 shadow-xl'
                                                : 'hover:shadow-lg'
                                    }`}
                            >
                                {isExactCurrentPlan(plan) ? (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                        <Badge
                                            variant="default"
                                            className="gap-1 bg-green-600 shadow-lg px-3 py-1 font-bold"
                                        >
                                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                                            {t('billing.plans.your_plan', 'Your Plan')}
                                        </Badge>
                                    </div>
                                ) : (
                                    plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                            <Badge className="gap-1 bg-primary shadow-lg px-3 py-1 font-bold animate-pulse-premium">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                {t('billing.plans.most_popular', 'Most Popular')}
                                            </Badge>
                                        </div>
                                    )
                                )}
                                <CardHeader className="text-center pt-8">
                                    <CardTitle className="text-2xl font-black tracking-tight">
                                        {plan.name}
                                    </CardTitle>
                                    <CardDescription className="font-medium text-muted-foreground/80">
                                        {plan.description}
                                    </CardDescription>
                                    <div className="mt-6">
                                        <span className="text-5xl font-black tracking-tighter">
                                            $
                                            {billingPeriod === 'monthly'
                                                ? plan.price.monthly
                                                : plan.price.yearly}
                                        </span>
                                        <span className="text-muted-foreground font-bold text-lg">
                                            /
                                            {billingPeriod === 'monthly'
                                                ? t('common.mo', 'mo')
                                                : t('common.yr', 'yr')}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 px-8 pt-4">
                                    <ul className="space-y-4">
                                        {plan.features.map((feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3 text-sm font-medium text-foreground/80"
                                            >
                                                <div className="mt-0.5 rounded-full bg-green-100 p-0.5 dark:bg-green-900/30">
                                                    <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 stroke-[3]" />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="pb-8 px-8">
                                    {plan.id === 'free' ? (
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 rounded-xl font-bold transition-all hover:bg-muted"
                                            disabled={
                                                currentPlan === 'free' ||
                                                !isOwner ||
                                                processing !== null
                                            }
                                            onClick={handleCancelSubscription}
                                        >
                                            {processing === 'free' && (
                                                <Spinner className="mr-2" />
                                            )}
                                            {getButtonText(plan)}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant={
                                                isExactCurrentPlan(plan)
                                                    ? 'secondary'
                                                    : plan.popular
                                                        ? 'default'
                                                        : 'outline'
                                            }
                                            className={`w-full h-12 rounded-xl font-bold transition-all active:scale-95 ${!isExactCurrentPlan(plan) && (plan.popular || plan.id === recommendedPlan)
                                                    ? 'animate-pulse-premium shadow-lg shadow-primary/20 border-none px-8'
                                                    : ''
                                                }`}
                                            disabled={
                                                isExactCurrentPlan(plan) ||
                                                !isOwner ||
                                                processing !== null
                                            }
                                            onClick={() => handleSubscribe(plan.id)}
                                        >
                                            {processing === plan.id && (
                                                <Spinner className="mr-2" />
                                            )}
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
                            <CardTitle>{t('billing.plans.faq.title', 'Frequently Asked Questions')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium">
                                    {t('billing.plans.faq.change_plans', 'Can I change plans later?')}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {t('billing.plans.faq.change_plans_answer', 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated.')}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium">
                                    {t('billing.plans.faq.payment_methods', 'What payment methods do you accept?')}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {t('billing.plans.faq.payment_methods_answer', 'We accept all major credit cards (Visa, MasterCard, American Express) through our secure payment processor, Stripe.')}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium">
                                    {t('billing.plans.faq.cancel', 'Can I cancel my subscription?')}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {t('billing.plans.faq.cancel_answer', "Yes, you can cancel your subscription at any time. You'll continue to have access to paid features until the end of your billing period.")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {!isOwner && (
                        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50">
                            <CardContent className="py-4">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    {t('billing.plans.only_owner', 'Only the workspace owner can manage billing and subscriptions.')}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
