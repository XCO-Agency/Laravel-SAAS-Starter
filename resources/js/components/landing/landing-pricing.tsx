import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

const plans = [
    {
        id: 'free',
        name: 'Free',
        description: 'Perfect for trying out Laravel SAAS Starter',
        price: { monthly: 0, yearly: 0 },
        features: [
            '1 Workspace',
            'Up to 3 team members',
            'Basic analytics',
            'Community support',
            '1GB storage',
        ],
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'For growing teams and businesses',
        price: { monthly: 29, yearly: 290 },
        features: [
            'Up to 5 Workspaces',
            'Up to 20 team members',
            'Advanced analytics',
            'Priority email support',
            '25GB storage',
            'Custom branding',
            'API access',
        ],
        popular: true,
    },
    {
        id: 'business',
        name: 'Business',
        description: 'For enterprises with advanced needs',
        price: { monthly: 99, yearly: 990 },
        features: [
            'Unlimited Workspaces',
            'Unlimited team members',
            'Enterprise analytics',
            '24/7 phone support',
            'Unlimited storage',
            'White-label solution',
            'Dedicated account manager',
            'Custom integrations',
            'SLA guarantee',
        ],
        popular: false,
    },
];

export function LandingPricing() {
    const { auth } = usePage<SharedData>().props;
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <section id="pricing" className="py-20 sm:py-32 bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Simple,{' '}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Transparent
                        </span>{' '}
                        Pricing
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Choose the plan that's right for you. All plans include a 14-day free trial.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="mt-10 flex items-center justify-center gap-4">
                    <span
                        className={`cursor-pointer text-sm font-medium ${billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}
                        onClick={() => setBillingPeriod('monthly')}
                    >
                        Monthly
                    </span>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={billingPeriod === 'yearly'}
                        onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${billingPeriod === 'yearly' ? 'bg-primary' : 'bg-input'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 rounded-full bg-background transition-transform ${billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                    <span
                        className={`cursor-pointer text-sm font-medium ${billingPeriod === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}
                        onClick={() => setBillingPeriod('yearly')}
                    >
                        Yearly
                        <Badge variant="secondary" className="ml-2">
                            Save 17%
                        </Badge>
                    </span>
                </div>

                {/* Pricing Cards */}
                <div className="mt-12 grid gap-8 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg ring-2 ring-primary' : ''
                                }`}
                        >
                            {plan.popular && (
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
                                        ${billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly}
                                    </span>
                                    <span className="text-muted-foreground">
                                        /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant={plan.popular ? 'default' : 'outline'}
                                    className="w-full"
                                    asChild
                                >
                                    <Link href={auth.user ? '/billing/plans' : register()}>
                                        {plan.id === 'free' ? 'Get Started' : 'Start Free Trial'}
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
