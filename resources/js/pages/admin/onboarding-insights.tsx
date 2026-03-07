import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Compass,
    TrendingDown,
    UserPlus,
    Users,
} from 'lucide-react';

interface FunnelStep {
    step: string;
    viewed: number;
    completed: number;
}

interface DropOffStep {
    step: string;
    dropped: number;
    drop_rate: number;
}

interface DailyCompletion {
    date: string;
    count: number;
}

interface OnboardingInsightsProps {
    metrics: {
        total_registered: number;
        total_onboarded: number;
        completion_rate: number;
        avg_time_minutes: number | null;
    };
    funnel: FunnelStep[];
    dropOff: DropOffStep[];
    dailyCompletions: DailyCompletion[];
}

const stepLabels: Record<string, string> = {
    welcome: 'Welcome',
    workspace: 'Workspace Setup',
    plan: 'Plan Selection',
};

const stepColors: Record<string, string> = {
    welcome: 'bg-emerald-500',
    workspace: 'bg-blue-500',
    plan: 'bg-violet-500',
};

export default function OnboardingInsights({
    metrics,
    funnel,
    dropOff,
    dailyCompletions,
}: OnboardingInsightsProps) {
    const maxDaily = Math.max(...dailyCompletions.map((d) => d.count), 1);
    const maxViewed = Math.max(...funnel.map((f) => f.viewed), 1);

    const formatTime = (minutes: number | null) => {
        if (minutes === null) return 'N/A';
        if (minutes < 1) return '< 1 min';
        if (minutes < 60) return `${Math.round(minutes)} min`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    return (
        <AdminLayout>
            <Head title="Onboarding Insights" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl border border-sidebar-border/70 p-4 md:p-6 lg:p-8">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Compass className="h-6 w-6" />
                        Onboarding Insights
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Understand where users drop off during onboarding and monitor completion rates over the last 30 days.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">New Registrations</p>
                                    <p className="text-3xl font-bold">{metrics.total_registered}</p>
                                </div>
                                <UserPlus className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Fully Onboarded</p>
                                    <p className="text-3xl font-bold">{metrics.total_onboarded}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-emerald-500/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                                    <p className="text-3xl font-bold">{metrics.completion_rate}%</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg. Time to Complete</p>
                                    <p className="text-3xl font-bold">{formatTime(metrics.avg_time_minutes)}</p>
                                </div>
                                <Clock className="h-8 w-8 text-violet-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Funnel Visualization */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Onboarding Funnel</CardTitle>
                        <CardDescription>How many users viewed and completed each step.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {funnel.map((step, index) => {
                                const viewedWidth = (step.viewed / maxViewed) * 100;
                                const completedWidth = step.viewed > 0 ? (step.completed / step.viewed) * 100 : 0;

                                return (
                                    <div key={step.step}>
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                                    {index + 1}
                                                </span>
                                                <span className="font-medium text-sm">{stepLabels[step.step] ?? step.step}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>Viewed: <strong className="text-foreground">{step.viewed}</strong></span>
                                                <span>Completed: <strong className="text-foreground">{step.completed}</strong></span>
                                            </div>
                                        </div>

                                        {/* Viewed bar */}
                                        <div className="space-y-1">
                                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full ${stepColors[step.step] ?? 'bg-primary'} opacity-30 transition-all`}
                                                    style={{ width: `${viewedWidth}%` }}
                                                />
                                            </div>
                                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full ${stepColors[step.step] ?? 'bg-primary'} transition-all`}
                                                    style={{ width: `${(step.completed / maxViewed) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {step.viewed > 0 && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {completedWidth.toFixed(0)}% completion rate for this step
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary opacity-30" />
                                Viewed
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                                Completed
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Drop-off Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                Drop-off Points
                            </CardTitle>
                            <CardDescription>Users who viewed a step but didn't complete it.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dropOff.some((d) => d.dropped > 0) ? (
                                <div className="space-y-4">
                                    {dropOff.map((step) => (
                                        <div key={step.step} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center justify-between text-sm">
                                                    <span className="font-medium">{stepLabels[step.step] ?? step.step}</span>
                                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                                        {step.drop_rate > 30 && (
                                                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                                        )}
                                                        {step.dropped} dropped ({step.drop_rate}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${step.drop_rate > 50 ? 'bg-red-500' : step.drop_rate > 30 ? 'bg-amber-500' : 'bg-green-500'}`}
                                                        style={{ width: `${step.drop_rate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No drop-off data available yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Daily Completions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Daily Completions (14 Days)</CardTitle>
                            <CardDescription>Users who finished onboarding per day.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-1.5" style={{ height: 160 }}>
                                {dailyCompletions.map((day) => {
                                    const heightPercent = (day.count / maxDaily) * 100;

                                    return (
                                        <div
                                            key={day.date}
                                            className="group relative flex flex-1 flex-col items-center"
                                        >
                                            <div
                                                className="w-full rounded-t bg-emerald-500/80 transition-colors group-hover:bg-emerald-500"
                                                style={{ height: `${heightPercent}%`, minHeight: day.count > 0 ? 4 : 0 }}
                                            />

                                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                                                <div className="rounded-md bg-popover px-2.5 py-1.5 text-xs shadow-md border whitespace-nowrap">
                                                    <p className="font-medium">{day.date}</p>
                                                    <p>{day.count} completions</p>
                                                </div>
                                            </div>

                                            <span className="mt-1.5 text-[10px] text-muted-foreground truncate w-full text-center">
                                                {day.date.split(' ')[1]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
