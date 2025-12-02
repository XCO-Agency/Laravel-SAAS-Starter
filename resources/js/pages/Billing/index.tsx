import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Invoice, type Plan, type Workspace, type WorkspaceRole } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle, CreditCard, Download, ExternalLink, Receipt, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface Subscription {
    status: string;
    ends_at: string | null;
    on_grace_period: boolean;
    cancelled: boolean;
}

interface BillingWorkspace extends Workspace {
    on_trial?: boolean;
    trial_ends_at?: string | null;
}

interface BillingIndexProps {
    workspace: BillingWorkspace;
    subscription: Subscription | null;
    invoices: Invoice[];
    plans: Plan[];
    userRole: WorkspaceRole;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/billing' },
];

export default function BillingIndex({
    workspace,
    subscription,
    invoices,
    plans,
    userRole,
}: BillingIndexProps) {
    const isOwner = userRole === 'owner';
    const currentPlan = plans.find((p) => p.name === workspace.plan);
    const [portalLoading, setPortalLoading] = useState(false);

    const handlePortalRedirect = async () => {
        setPortalLoading(true);
        try {
            const response = await fetch('/billing/portal', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data = await response.json();
            if (data.portal_url) {
                window.location.href = data.portal_url;
            }
        } catch (error) {
            console.error('Portal redirect error:', error);
            setPortalLoading(false);
        }
    };

    const getStatusBadge = () => {
        if (!subscription) {
            return <Badge variant="secondary">Free</Badge>;
        }

        if (subscription.cancelled && subscription.on_grace_period) {
            return <Badge variant="destructive">Cancelling</Badge>;
        }

        if (subscription.status === 'trialing') {
            return <Badge variant="outline">Trial</Badge>;
        }

        if (subscription.status === 'active') {
            return <Badge variant="default">Active</Badge>;
        }

        return <Badge variant="destructive">{subscription.status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing" />

            <div className="space-y-6">
                <Heading
                    title="Billing"
                    description="Manage your subscription and billing information."
                />

                {/* Current Plan */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Current Plan
                                </CardTitle>
                                <CardDescription>
                                    Your workspace is on the {workspace.plan} plan
                                </CardDescription>
                            </div>
                            {getStatusBadge()}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                                <p className="text-3xl font-bold">{workspace.plan}</p>
                                {currentPlan && (
                                    <p className="text-muted-foreground">
                                        {currentPlan.price.monthly > 0
                                            ? `$${currentPlan.price.monthly}/month`
                                            : 'Free forever'}
                                    </p>
                                )}
                                {workspace.on_trial && workspace.trial_ends_at && (
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                        Trial ends on{' '}
                                        {new Date(workspace.trial_ends_at).toLocaleDateString()}
                                    </p>
                                )}
                                {subscription?.cancelled && subscription.ends_at && (
                                    <p className="text-sm text-destructive">
                                        Your subscription will end on{' '}
                                        {new Date(subscription.ends_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {isOwner && (
                                    <>
                                        <Button asChild>
                                            <Link href="/billing/plans">
                                                {workspace.plan === 'Free' ? 'Upgrade' : 'Change Plan'}
                                            </Link>
                                        </Button>
                                        {subscription && (
                                            <Button
                                                variant="outline"
                                                onClick={handlePortalRedirect}
                                                disabled={portalLoading}
                                            >
                                                {portalLoading ? (
                                                    <Spinner className="mr-2" />
                                                ) : (
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                )}
                                                Manage Subscription
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Plan Features */}
                        {currentPlan && (
                            <div className="mt-6 border-t pt-6">
                                <h4 className="mb-3 text-sm font-medium">Plan Features</h4>
                                <ul className="grid gap-2 md:grid-cols-2">
                                    {currentPlan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Method */}
                {subscription && isOwner && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Method
                            </CardTitle>
                            <CardDescription>
                                Manage your payment method through the billing portal.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                onClick={handlePortalRedirect}
                                disabled={portalLoading}
                            >
                                {portalLoading ? (
                                    <Spinner className="mr-2" />
                                ) : (
                                    <CreditCard className="mr-2 h-4 w-4" />
                                )}
                                Update Payment Method
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Invoices */}
                {invoices.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Invoices
                            </CardTitle>
                            <CardDescription>
                                Download your past invoices for your records.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {invoices.map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div>
                                            <p className="font-medium">{invoice.date}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {invoice.total}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <a
                                                href={invoice.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* No Subscription Notice */}
                {!subscription && workspace.plan === 'Free' && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-medium">No Active Subscription</h3>
                            <p className="mb-4 text-center text-muted-foreground">
                                Upgrade to a paid plan to unlock more features and team members.
                            </p>
                            {isOwner && (
                                <Button asChild>
                                    <Link href="/billing/plans">View Plans</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

