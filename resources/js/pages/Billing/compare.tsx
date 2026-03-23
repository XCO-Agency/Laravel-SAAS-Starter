import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { useTranslations } from '@/hooks/use-translations';
import http from '@/lib/http';
import AppLayout from '@/layouts/app-layout';
import WorkspaceLayout from '@/layouts/settings/workspace-layout';
import { type BreadcrumbItem, type Plan, type WorkspaceRole } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, HelpCircle, Minus, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface ComparePageProps {
    plans: Plan[];
    currentPlan: string;
    userRole: WorkspaceRole;
}

interface FeatureComparison {
    category: string;
    features: {
        name: string;
        description?: string;
        values: Record<string, string | boolean | number>;
    }[];
}

export default function ComparePlans({ plans, currentPlan, userRole }: ComparePageProps) {
    const { t } = useTranslations();
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [processing, setProcessing] = useState<string | null>(null);
    const { addToast } = useToast();
    const isOwner = userRole === 'owner' || userRole === 'admin';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('billing.title', 'Billing'), href: '/billing' },
        { title: t('billing.compare.title', 'Compare Plans'), href: '/billing/compare' },
    ];

    // Build comparison matrix from plan features
    const buildComparisonMatrix = (): FeatureComparison[] => {
        const allFeatures = new Map<string, Set<string>>();
        
        // Collect all unique features across plans
        plans.forEach(plan => {
            plan.features.forEach(feature => {
                if (!allFeatures.has(feature)) {
                    allFeatures.set(feature, new Set());
                }
                allFeatures.get(feature)?.add(plan.id);
            });
        });

        // Group features by category (simplified - in production, you'd have categories in the data)
        return [
            {
                category: 'Core Features',
                features: Array.from(allFeatures.entries()).map(([feature, planIds]) => ({
                    name: feature,
                    description: undefined,
                    values: Object.fromEntries(
                        plans.map(plan => [
                            plan.id,
                            plan.features.includes(feature)
                        ])
                    ) as Record<string, boolean>,
                })),
            },
        ];
    };

    const comparisonMatrix = buildComparisonMatrix();

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

    const getPlanById = (id: string) => plans.find(p => p.id === id);
    const paidPlans = plans.filter(p => p.id !== 'free');
    const freePlan = plans.find(p => p.id === 'free');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('billing.compare.title', 'Compare Plans')} />

            <WorkspaceLayout
                title={t('billing.compare.title', 'Compare Plans')}
                description={t('billing.compare.description', 'Find the perfect plan for your team')}
                fullWidth
            >
                <div className="space-y-8">
                    {/* Billing Period Toggle */}
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-full">
                            <Button
                                variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setBillingPeriod('monthly')}
                                className="rounded-full px-6"
                            >
                                Monthly
                            </Button>
                            <Button
                                variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setBillingPeriod('yearly')}
                                className="rounded-full px-6"
                            >
                                Yearly
                                <Badge variant="secondary" className="ml-2 text-[10px]">
                                    Save 20%
                                </Badge>
                            </Button>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle>Feature Comparison</CardTitle>
                            <CardDescription>
                                Compare all features across plans side by side
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/20">
                                            <th className="text-left p-4 font-medium text-muted-foreground min-w-[200px]">
                                                Feature
                                            </th>
                                            {plans.map(plan => (
                                                <th key={plan.id} className="p-4 text-center min-w-[150px]">
                                                    <div className="space-y-2">
                                                        <div className="font-bold text-lg">{plan.name}</div>
                                                        <div className="text-2xl font-bold text-primary">
                                                            ${billingPeriod === 'yearly' 
                                                                ? (plan.price.yearly / 12).toFixed(0) 
                                                                : plan.price.monthly}
                                                            <span className="text-sm font-normal text-muted-foreground">/mo</span>
                                                        </div>
                                                        {billingPeriod === 'yearly' && plan.price.yearly > 0 && (
                                                            <div className="text-xs text-muted-foreground">
                                                                ${plan.price.yearly}/year billed annually
                                                            </div>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Plan Limits Row */}
                                        <tr className="border-b bg-muted/5">
                                            <td className="p-4 font-medium">Team Members</td>
                                            {plans.map(plan => (
                                                <td key={plan.id} className="p-4 text-center">
                                                    {plan.limits?.members === -1 ? (
                                                        <span className="font-bold text-primary">Unlimited</span>
                                                    ) : (
                                                        <span className="font-bold text-foreground">{plan.limits?.members || 0}</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-4 font-medium">Workspaces</td>
                                            {plans.map(plan => (
                                                <td key={plan.id} className="p-4 text-center">
                                                    {plan.limits?.workspaces === -1 ? (
                                                        <span className="font-bold text-primary">Unlimited</span>
                                                    ) : (
                                                        <span className="font-bold text-foreground">{plan.limits?.workspaces || 1}</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="border-b bg-muted/5">
                                            <td className="p-4 font-medium">Storage</td>
                                            {plans.map(plan => (
                                                <td key={plan.id} className="p-4 text-center">
                                                    <span className="font-bold text-foreground">{plan.limits?.storage || '1GB'}</span>
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Feature Rows */}
                                        {comparisonMatrix.map((category) => (
                                            category.features.map((feature, idx) => (
                                                <tr key={feature.name} className={idx % 2 === 0 ? 'bg-muted/5' : ''}>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{feature.name}</span>
                                                            {feature.description && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger>
                                                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p className="max-w-xs">{feature.description}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {plans.map(plan => {
                                                        const value = feature.values[plan.id];
                                                        return (
                                                            <td key={plan.id} className="p-4 text-center">
                                                                {typeof value === 'boolean' ? (
                                                                    value ? (
                                                                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                                                                    ) : (
                                                                        <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
                                                                    )
                                                                ) : (
                                                                    <span className="font-medium">{String(value)}</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))
                                        ))}

                                        {/* Action Row */}
                                        <tr className="border-t bg-muted/10">
                                            <td className="p-4"></td>
                                            {plans.map(plan => (
                                                <td key={plan.id} className="p-4 text-center">
                                                    {currentPlan === plan.id ? (
                                                        <Badge variant="default" className="w-full py-2">
                                                            <Check className="h-4 w-4 mr-1" />
                                                            Current Plan
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            className="w-full"
                                                            disabled={!isOwner || processing === plan.id}
                                                            onClick={() => handleSubscribe(plan.id)}
                                                        >
                                                            {processing === plan.id ? (
                                                                <Spinner className="mr-2" />
                                                            ) : plan.id === 'free' ? (
                                                                'Downgrade'
                                                            ) : currentPlan === 'free' ? (
                                                                'Upgrade'
                                                            ) : (
                                                                'Switch'
                                                            )}
                                                        </Button>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* FAQ Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h4 className="font-semibold">Can I change plans anytime?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Yes! You can upgrade or downgrade at any time. Upgrades take effect immediately, 
                                    and downgrades take effect at the end of your billing period.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold">What happens if I exceed my limits?</h4>
                                <p className="text-sm text-muted-foreground">
                                    We'll notify you when you're approaching your limits. You can upgrade to a higher 
                                    plan or purchase additional capacity as needed.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold">Is there a free trial?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Yes! All paid plans come with a 14-day free trial. No credit card required 
                                    to start your trial.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold">What payment methods do you accept?</h4>
                                <p className="text-sm text-muted-foreground">
                                    We accept all major credit cards (Visa, Mastercard, American Express) 
                                    and PayPal. Enterprise customers can pay by invoice.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CTA */}
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                            Still have questions? We're here to help.
                        </p>
                        <Button variant="outline" asChild>
                            <a href="mailto:support@example.com">Contact Sales</a>
                        </Button>
                    </div>
                </div>
            </WorkspaceLayout>
        </AppLayout>
    );
}
