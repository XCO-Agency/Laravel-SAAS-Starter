import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { useTranslations } from '@/hooks/use-translations';
import http from '@/lib/http';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import {
    type BreadcrumbItem,
    type Invoice,
    type Plan,
    type WorkspaceRole,
} from '@/types';
import { Head, Link, Deferred } from '@inertiajs/react';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertCircle,
    CheckCircle,
    CreditCard,
    Download,
    ExternalLink,
    Receipt,
    Sparkles,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Subscription {
    status: string;
    ends_at: string | null;
    on_grace_period: boolean;
    cancelled: boolean;
}

interface BillingWorkspace {
    id: string;
    name: string;
    plan: string;
    on_trial?: boolean;
    trial_ends_at?: string | null;
    seat_count: number;
    seat_limit: number;
}

interface UsageMetric {
    label: string;
    count: number;
    limit: number;
    percentage: number;
}

interface UpcomingInvoice {
    amount: string;
    date: string;
}

interface BillingIndexProps {
    workspace: BillingWorkspace;
    subscription: Subscription | null;
    upcoming_invoice: UpcomingInvoice | null;
    usage: Record<string, UsageMetric>;
    invoices: Invoice[];
    plans: Plan[];
    userRole: WorkspaceRole;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Billing', href: '/billing' }];

export default function BillingIndex({
    workspace,
    subscription,
    upcoming_invoice,
    usage,
    invoices,
    plans,
    userRole,
}: BillingIndexProps) {
    const { t } = useTranslations();
    const isOwner = userRole === 'owner';
    const currentPlan = plans.find((p) => p.name === workspace.plan);
    const [portalLoading, setPortalLoading] = useState(false);
    const [resumeLoading, setResumeLoading] = useState(false);
    const { addToast } = useToast();

    const handleResumeSubscription = async () => {
        setResumeLoading(true);
        try {
            const { data } = await http.post<{ success?: boolean; error?: string }>('/billing/resume');
            if (data.success) {
                window.location.reload();
            } else {
                addToast(
                    data.error || 'Failed to resume subscription',
                    'error',
                );
                setResumeLoading(false);
            }
        } catch (error) {
            console.error('Resume error:', error);
            setResumeLoading(false);
        }
    };

    const handlePortalRedirect = async () => {
        setPortalLoading(true);
        try {
            const { data } = await http.get<{ portal_url?: string }>('/billing/portal');
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
            return <Badge variant="secondary">{t('billing.free', 'Free')}</Badge>;
        }

        if (subscription.cancelled && subscription.on_grace_period) {
            return <Badge variant="destructive">{t('billing.cancelling', 'Cancelling')}</Badge>;
        }

        if (subscription.status === 'trialing') {
            return <Badge variant="outline">{t('billing.trial', 'Trial')}</Badge>;
        }

        if (subscription.status === 'active') {
            return <Badge variant="default">{t('billing.active', 'Active')}</Badge>;
        }

        return <Badge variant="destructive">{subscription.status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('billing.title', 'Billing')} />

            <SettingsLayout
                title={t('billing.title', 'Billing')}
                description={t('billing.description', 'Manage your subscription and billing information')}
                fullWidth
            >
                <div className="space-y-8 pb-12">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Current Plan */}
                        <Card className="lg:col-span-2 glass overflow-hidden border-2 border-primary/10 transition-all hover:border-primary/30 animate-fade-in-up">
                            <CardHeader className="bg-muted/30 pb-6 border-b border-primary/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            {t('billing.current_plan', 'Current Plan')}
                                        </CardTitle>
                                        <CardDescription>
                                            {t('billing.your_workspace_on', 'Your workspace is on the {{plan}} plan.', { plan: workspace.plan })}
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge()}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                    <div className="space-y-1">
                                        <p className="text-4xl font-extrabold tracking-tight">
                                            {workspace.plan}
                                        </p>
                                        {currentPlan && (
                                            <p className="text-muted-foreground font-medium">
                                                {currentPlan.price.monthly > 0
                                                    ? `$${currentPlan.price.monthly}/month`
                                                    : t('billing.free_forever', 'Free forever')}
                                            </p>
                                        )}
                                        {workspace.on_trial &&
                                            workspace.trial_ends_at && (
                                                <div className="flex items-center gap-1.5 mt-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 w-fit">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    {t('billing.trial_ends', 'Trial ends on {{date}}', { date: new Date(workspace.trial_ends_at).toLocaleDateString() })}
                                                </div>
                                            )}
                                        {subscription?.cancelled &&
                                            subscription.ends_at && (
                                                <div className="space-y-2 mt-2">
                                                    <p className="text-sm font-medium text-destructive">
                                                        {t('billing.subscription_ends', 'Your subscription will end on {{date}}', { date: new Date(subscription.ends_at).toLocaleDateString() })}
                                                    </p>
                                                    {subscription.on_grace_period &&
                                                        isOwner && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={
                                                                    handleResumeSubscription
                                                                }
                                                                disabled={resumeLoading}
                                                                className="rounded-full"
                                                            >
                                                                {resumeLoading && (
                                                                    <Spinner className="mr-2" />
                                                                )}
                                                                {t('billing.resume_subscription', 'Resume Subscription')}
                                                            </Button>
                                                        )}
                                                </div>
                                            )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {isOwner && (
                                            <>
                                                <Button asChild className="rounded-full px-8 shadow-sm transition-transform active:scale-95">
                                                    <Link href="/billing/plans">
                                                        {workspace.plan === 'Free'
                                                            ? t('billing.upgrade', 'Upgrade Now')
                                                            : t('billing.change_plan', 'Change Plan')}
                                                    </Link>
                                                </Button>
                                                {subscription && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={handlePortalRedirect}
                                                        disabled={portalLoading}
                                                        className="rounded-full shadow-sm"
                                                    >
                                                        {portalLoading ? (
                                                            <Spinner className="mr-2" />
                                                        ) : (
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                        )}
                                                        {t('billing.manage_subscription', 'Manage')}
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Plan Features */}
                                {currentPlan && (
                                    <div className="mt-8 border-t bg-muted/30 -mx-6 px-6 py-6">
                                        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {t('billing.plan_includes', 'Included in your plan')}
                                        </h4>
                                        <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
                                            {currentPlan.features.map(
                                                (feature, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-center gap-2.5 text-sm font-medium text-foreground/80"
                                                    >
                                                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                                        {feature}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-6 lg:col-span-1">
                            {/* Upcoming Invoice */}
                            <Deferred data="upcoming_invoice" fallback={
                                <Card className="glass animate-fade-in-up delay-200 border-none">
                                    <ViewSkeleton rows={2} />
                                </Card>
                            }>
                                {upcoming_invoice && (
                                    <Card className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 animate-fade-in-up delay-200 border-none">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                Upcoming Payment
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold">${(Number(upcoming_invoice.amount) / 100).toFixed(2)}</span>
                                                <span className="text-xs opacity-70">on {upcoming_invoice.date}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </Deferred>

                            {/* Payment Method Quick Look */}
                            {subscription && isOwner && (
                                <Card className="glass transition-all hover:bg-muted/30 animate-fade-in-up delay-300">
                                    <CardHeader className="pb-3 pt-4">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-muted-foreground">
                                            <CreditCard className="h-3.5 w-3.5" />
                                            {t('billing.payment_method', 'Payment Method')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">Managed via Stripe</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handlePortalRedirect}
                                                disabled={portalLoading}
                                                className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/5"
                                            >
                                                Update
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Trial Countdown or Help */}
                            {!subscription && workspace.plan === 'Free' && (
                                <Card className="glass bg-muted/20 border-dashed animate-fade-in-up delay-300">
                                    <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                                        <Sparkles className="h-10 w-10 text-primary mb-4 opacity-50" />
                                        <p className="text-lg font-bold mb-2">Unlock more power</p>
                                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed px-6">
                                            Get unlimited workspaces, priority support, and advanced analytics to supercharge your workflow.
                                        </p>
                                        <Button asChild size="lg" className="rounded-full w-full max-w-[180px] font-bold shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 animate-pulse-premium">
                                            <Link href="/billing/plans">Explore Plans</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Usage Overview */}
                    <Deferred data="usage" fallback={
                        <Card className="glass overflow-hidden shadow-sm animate-fade-in-up delay-400">
                            <CardHeader className="border-b bg-muted/10">
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <ViewSkeleton rows={3} />
                            </CardContent>
                        </Card>
                    }>
                        <Card className="glass overflow-hidden shadow-sm animate-fade-in-up delay-400">
                            <CardHeader className="border-b bg-muted/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-muted-foreground" />
                                            {t('billing.usage_overview', 'Usage Overview')}
                                        </CardTitle>
                                        <CardDescription>
                                            {t('billing.usage_description', 'Your current resource consumption')}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="font-mono bg-background/50">
                                        {workspace.plan} Plan
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-8 md:grid-cols-3">
                                    {Object.entries(usage).map(([key, item]) => (
                                        <div key={key} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
                                                    {item.label}
                                                </span>
                                                <span className="text-sm font-mono font-bold">
                                                    {item.count} / {item.limit === -1 ? '∞' : item.limit}
                                                </span>
                                            </div>
                                            <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/50 border border-muted-foreground/10">
                                                <div
                                                    className={cn(
                                                        "h-full transition-all duration-1000 ease-out rounded-full",
                                                        item.percentage > 90 ? "bg-destructive shadow-[0_0_12px_rgba(239,68,68,0.4)]" :
                                                            item.percentage > 75 ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.3)]" :
                                                                "bg-primary shadow-[0_0_12px_rgba(var(--primary),0.3)]"
                                                    )}
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                            {item.limit !== -1 && item.percentage > 80 && (
                                                <p className="text-[10px] font-bold text-destructive flex items-center gap-1 animate-pulse">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {100 - item.percentage}% remaining
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </Deferred>

                    {/* Invoices */}
                    <Deferred data="invoices" fallback={
                        <Card className="glass shadow-sm border-none animate-fade-in-up delay-500">
                            <CardHeader className="pb-4">
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent>
                                <ViewSkeleton rows={5} />
                            </CardContent>
                        </Card>
                    }>
                        {invoices.length > 0 && (
                            <Card className="glass shadow-sm border-none animate-fade-in-up delay-500">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Receipt className="h-5 w-5 text-muted-foreground" />
                                        {t('billing.invoice_history', 'Invoice History')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('billing.invoice_description', 'Download your past invoices and receipts')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-xl border border-muted-foreground/10 overflow-hidden bg-background/30">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-muted/30 border-b border-muted-foreground/10 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                                                    <th className="px-6 py-4 text-left">Date</th>
                                                    <th className="px-6 py-4 text-left">Amount</th>
                                                    <th className="px-6 py-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-muted-foreground/10">
                                                {invoices.map((invoice: Invoice) => (
                                                    <tr key={invoice.id} className="hover:bg-muted/20 transition-colors group">
                                                        <td className="px-6 py-4 font-medium">{invoice.date}</td>
                                                        <td className="px-6 py-4 font-mono font-bold">${(Number(invoice.total) / 100).toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary rounded-full px-4 h-8"
                                                            >
                                                                <a href={invoice.pdf_url}>
                                                                    <Download className="mr-2 h-3.5 w-3.5" />
                                                                    PDF
                                                                </a>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </Deferred>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

function ViewSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            ))}
        </div>
    );
}
