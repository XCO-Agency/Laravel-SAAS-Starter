import { HelpTooltip } from '@/components/help-tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    DollarSign,
    TrendingUp,
    Users,
} from 'lucide-react';

interface PlanDistributionItem {
    plan: string;
    price_id: string;
    count: number;
}

interface MonthlySubscription {
    month: string;
    new: number;
    canceled: number;
    net: number;
}

interface DailyNewSub {
    date: string;
    count: number;
}

interface RevenueByPlan {
    plan: string;
    monthly_subs: number;
    yearly_subs: number;
    estimated_mrr: number;
}

interface RevenueAnalyticsProps {
    summary: {
        total_active: number;
        total_trialing: number;
        total_canceled: number;
        total_past_due: number;
        workspaces_on_trial: number;
    };
    mrr: number;
    churnRate: number;
    trialConversionRate: number;
    planDistribution: PlanDistributionItem[];
    monthlySubscriptions: MonthlySubscription[];
    dailyNewSubs: DailyNewSub[];
    revenueByPlan: RevenueByPlan[];
}

const planColors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
];

export default function RevenueAnalytics({
    summary,
    mrr,
    churnRate,
    trialConversionRate,
    planDistribution,
    monthlySubscriptions,
    dailyNewSubs,
    revenueByPlan,
}: RevenueAnalyticsProps) {
    const maxDailySubs = Math.max(...dailyNewSubs.map((d) => d.count), 1);
    const maxMonthlySubs = Math.max(
        ...monthlySubscriptions.map((m) => Math.max(m.new, m.canceled)),
        1,
    );
    const totalDistribution = planDistribution.reduce((acc, p) => acc + p.count, 0) || 1;
    const totalMrr = revenueByPlan.reduce((acc, p) => acc + p.estimated_mrr, 0);

    return (
        <AdminLayout>
            <Head title="Revenue Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl border border-sidebar-border/70 p-4 md:p-6 lg:p-8">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <DollarSign className="h-6 w-6" />
                        Revenue Analytics
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Monitor subscription metrics, revenue, and billing health across the platform.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        Estimated MRR
                                        <HelpTooltip content="Monthly Recurring Revenue estimated from active subscriptions and plan prices." />
                                    </p>
                                    <p className="text-3xl font-bold">${mrr.toLocaleString()}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-emerald-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                                    <p className="text-3xl font-bold">{summary.total_active}</p>
                                    {summary.total_trialing > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            + {summary.total_trialing} trialing
                                        </p>
                                    )}
                                </div>
                                <CreditCard className="h-8 w-8 text-blue-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        30-Day Churn
                                        <HelpTooltip content="Percentage of subscriptions canceled in the last 30 days relative to the subscriber base." />
                                    </p>
                                    <p className="text-3xl font-bold">{churnRate}%</p>
                                </div>
                                {churnRate > 5 ? (
                                    <ArrowDownRight className="h-8 w-8 text-red-500/30" />
                                ) : (
                                    <ArrowUpRight className="h-8 w-8 text-emerald-500/30" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        Trial Conversion
                                        <HelpTooltip content="Percentage of trial subscriptions that converted to active paid plans." />
                                    </p>
                                    <p className="text-3xl font-bold">{trialConversionRate}%</p>
                                    {summary.workspaces_on_trial > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            {summary.workspaces_on_trial} on trial now
                                        </p>
                                    )}
                                </div>
                                <TrendingUp className="h-8 w-8 text-violet-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Alerts */}
                {(summary.total_past_due > 0 || summary.total_canceled > 0) && (
                    <div className="flex flex-wrap gap-3">
                        {summary.total_past_due > 0 && (
                            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm dark:border-amber-800 dark:bg-amber-950">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <span className="text-amber-800 dark:text-amber-200">
                                    {summary.total_past_due} past due subscription{summary.total_past_due !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                        {summary.total_canceled > 0 && (
                            <div className="flex items-center gap-2 rounded-lg border border-muted bg-muted/50 px-4 py-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {summary.total_canceled} total canceled
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Daily New Subscriptions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Daily New Subscriptions (30 Days)</CardTitle>
                            <CardDescription>New subscription sign-ups per day</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-48 items-end gap-[2px]">
                                {dailyNewSubs.map((day, i) => (
                                    <div
                                        key={i}
                                        className="group relative flex flex-1 flex-col items-center"
                                    >
                                        <div
                                            className="w-full rounded-t bg-emerald-500/80 transition-colors group-hover:bg-emerald-500"
                                            style={{
                                                height: `${Math.max((day.count / maxDailySubs) * 100, 2)}%`,
                                            }}
                                        />
                                        <div className="pointer-events-none absolute -top-8 hidden rounded bg-popover px-2 py-1 text-xs shadow-md group-hover:block">
                                            <span className="font-medium">{day.count}</span>
                                            <br />
                                            <span className="text-muted-foreground">{day.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                <span>{dailyNewSubs[0]?.date}</span>
                                <span>{dailyNewSubs[dailyNewSubs.length - 1]?.date}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Subscription Flow */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Subscription Flow (6 Months)</CardTitle>
                            <CardDescription>New vs canceled subscriptions per month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-48 items-end gap-2">
                                {monthlySubscriptions.map((month, i) => (
                                    <div
                                        key={i}
                                        className="group relative flex flex-1 flex-col items-center gap-1"
                                    >
                                        <div className="flex w-full flex-1 items-end gap-[2px]">
                                            <div
                                                className="flex-1 rounded-t bg-emerald-500/80 transition-colors group-hover:bg-emerald-500"
                                                style={{
                                                    height: `${Math.max((month.new / maxMonthlySubs) * 100, 3)}%`,
                                                }}
                                            />
                                            <div
                                                className="flex-1 rounded-t bg-red-400/80 transition-colors group-hover:bg-red-400"
                                                style={{
                                                    height: `${Math.max((month.canceled / maxMonthlySubs) * 100, 3)}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="pointer-events-none absolute -top-12 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-xs shadow-md group-hover:block">
                                            <div className="flex items-center gap-1">
                                                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                                                New: {month.new}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                                                Canceled: {month.canceled}
                                            </div>
                                            <div className="font-medium">Net: {month.net > 0 ? '+' : ''}{month.net}</div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {month.month.split(' ')[0]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> New
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-block h-2 w-2 rounded-full bg-red-400" /> Canceled
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Plan Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Plan Distribution</CardTitle>
                            <CardDescription>Active &amp; trialing subscriptions by plan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {planDistribution.length === 0 ? (
                                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                                    No active subscriptions yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {planDistribution.map((plan, i) => {
                                        const pct = ((plan.count / totalDistribution) * 100).toFixed(1);
                                        const color = planColors[i % planColors.length];

                                        return (
                                            <div key={plan.price_id}>
                                                <div className="mb-1 flex items-center justify-between text-sm">
                                                    <span>{plan.plan}</span>
                                                    <span className="text-muted-foreground">
                                                        {plan.count} ({pct}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${color}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Revenue by Plan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Revenue by Plan</CardTitle>
                            <CardDescription>Estimated MRR breakdown by subscription plan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {revenueByPlan.length === 0 ? (
                                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                                    No paid plans configured.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {revenueByPlan.map((plan, i) => {
                                        const pct = totalMrr > 0 ? ((plan.estimated_mrr / totalMrr) * 100).toFixed(1) : '0.0';
                                        const color = planColors[i % planColors.length];

                                        return (
                                            <div key={plan.plan} className="rounded-lg border p-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{plan.plan}</span>
                                                    <span className="text-lg font-bold">
                                                        ${plan.estimated_mrr.toLocaleString()}/mo
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                                                    <span>{plan.monthly_subs} monthly</span>
                                                    <span>{plan.yearly_subs} yearly</span>
                                                    <span>{pct}% of MRR</span>
                                                </div>
                                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full rounded-full ${color}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="flex items-center justify-between border-t pt-3 text-sm font-medium">
                                        <span>Total Estimated MRR</span>
                                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                            ${totalMrr.toLocaleString()}/mo
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
