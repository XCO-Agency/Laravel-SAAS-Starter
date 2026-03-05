import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Bell,
    Inbox,
    Mail,
    TrendingUp,
} from 'lucide-react';

interface DailyDelivery {
    date: string;
    email: number;
    in_app: number;
}

interface TypeBreakdown {
    type: string;
    email: number;
    in_app: number;
    total: number;
}

interface CategoryBreakdown {
    category: string;
    email: number;
    in_app: number;
    total: number;
}

interface NotificationAnalyticsProps {
    metrics: {
        total: number;
        email: number;
        in_app: number;
        weekly_trend: number;
    };
    dailyDeliveries: DailyDelivery[];
    byType: TypeBreakdown[];
    byCategory: CategoryBreakdown[];
    channelSplit: {
        email: number;
        in_app: number;
    };
}

export default function NotificationAnalytics({
    metrics,
    dailyDeliveries,
    byType,
    byCategory,
    channelSplit,
}: NotificationAnalyticsProps) {
    const maxDaily = Math.max(
        ...dailyDeliveries.map((d) => d.email + d.in_app),
        1,
    );

    const TrendIcon = metrics.weekly_trend >= 0 ? ArrowUpRight : ArrowDownRight;
    const trendColor = metrics.weekly_trend >= 0 ? 'text-green-600' : 'text-red-500';

    return (
        <AdminLayout>
            <Head title="Notification Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl border border-sidebar-border/70 p-4 md:p-6 lg:p-8">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Bell className="h-6 w-6" />
                        Notification Analytics
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Track per-channel delivery counts and monitor notification preference impact over the last 30 days.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Deliveries</p>
                                    <p className="text-3xl font-bold">{metrics.total.toLocaleString()}</p>
                                </div>
                                <Bell className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="text-3xl font-bold">{metrics.email.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{channelSplit.email}% of total</p>
                                </div>
                                <Mail className="h-8 w-8 text-blue-500/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">In-App</p>
                                    <p className="text-3xl font-bold">{metrics.in_app.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{channelSplit.in_app}% of total</p>
                                </div>
                                <Inbox className="h-8 w-8 text-violet-500/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Weekly Trend</p>
                                    <p className="text-3xl font-bold flex items-center gap-1">
                                        <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                                        <span className={trendColor}>{Math.abs(metrics.weekly_trend)}%</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">vs previous week</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Deliveries Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Daily Deliveries (14 days)</CardTitle>
                        <CardDescription>Stacked bar chart of email vs in-app deliveries per day.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-1.5" style={{ height: 180 }}>
                            {dailyDeliveries.map((day) => {
                                const total = day.email + day.in_app;
                                const heightPercent = (total / maxDaily) * 100;
                                const emailPercent = total > 0 ? (day.email / total) * 100 : 0;

                                return (
                                    <div
                                        key={day.date}
                                        className="group relative flex flex-1 flex-col items-center"
                                    >
                                        <div
                                            className="w-full rounded-t overflow-hidden transition-all"
                                            style={{ height: `${heightPercent}%`, minHeight: total > 0 ? 4 : 0 }}
                                        >
                                            <div
                                                className="w-full bg-blue-500"
                                                style={{ height: `${emailPercent}%` }}
                                            />
                                            <div
                                                className="w-full bg-violet-500"
                                                style={{ height: `${100 - emailPercent}%` }}
                                            />
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                                            <div className="rounded-md bg-popover px-2.5 py-1.5 text-xs shadow-md border whitespace-nowrap">
                                                <p className="font-medium">{day.date}</p>
                                                <p className="text-blue-600 dark:text-blue-400">Email: {day.email}</p>
                                                <p className="text-violet-600 dark:text-violet-400">In-App: {day.in_app}</p>
                                            </div>
                                        </div>

                                        <span className="mt-1.5 text-[10px] text-muted-foreground truncate w-full text-center">
                                            {day.date.split(' ')[1]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />
                                Email
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-violet-500" />
                                In-App
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Channel Split + Category Breakdown */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Channel Split */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Channel Distribution</CardTitle>
                            <CardDescription>How deliveries split between email and in-app channels.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Visual bar */}
                                <div className="flex h-6 w-full overflow-hidden rounded-full">
                                    <div
                                        className="bg-blue-500 transition-all"
                                        style={{ width: `${channelSplit.email}%` }}
                                    />
                                    <div
                                        className="bg-violet-500 transition-all"
                                        style={{ width: `${channelSplit.in_app}%` }}
                                    />
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-blue-500" />
                                        Email: <strong>{channelSplit.email}%</strong>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Inbox className="h-4 w-4 text-violet-500" />
                                        In-App: <strong>{channelSplit.in_app}%</strong>
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">By Category</CardTitle>
                            <CardDescription>Delivery counts grouped by notification category.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {byCategory.length > 0 ? (
                                <div className="space-y-3">
                                    {byCategory.map((cat) => {
                                        const maxCatTotal = Math.max(...byCategory.map((c) => c.total), 1);

                                        return (
                                            <div key={cat.category}>
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="font-medium capitalize">{cat.category}</span>
                                                    <span className="text-muted-foreground">{cat.total}</span>
                                                </div>
                                                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="bg-blue-500 transition-all"
                                                        style={{ width: `${(cat.email / maxCatTotal) * 100}%` }}
                                                    />
                                                    <div
                                                        className="bg-violet-500 transition-all"
                                                        style={{ width: `${(cat.in_app / maxCatTotal) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No categorized deliveries in this period.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* By Notification Type */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">By Notification Type</CardTitle>
                        <CardDescription>Top notification types by delivery volume across channels.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {byType.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="py-2 pr-4 font-medium text-muted-foreground">Type</th>
                                            <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Email</th>
                                            <th className="py-2 pr-4 font-medium text-muted-foreground text-right">In-App</th>
                                            <th className="py-2 font-medium text-muted-foreground text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {byType.map((item) => (
                                            <tr key={item.type} className="border-b last:border-0">
                                                <td className="py-2.5 pr-4 font-mono text-xs">{item.type}</td>
                                                <td className="py-2.5 pr-4 text-right tabular-nums">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                                                        {item.email}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 pr-4 text-right tabular-nums">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
                                                        {item.in_app}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-right font-semibold tabular-nums">{item.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No notification deliveries recorded in this period.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
