import { HelpTooltip } from '@/components/help-tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import {
    BarChart3,
    Monitor,
    Smartphone,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';

interface DailySignup {
    date: string;
    count: number;
}

interface MonthlyGrowth {
    month: string;
    total: number;
}

interface DeviceStat {
    platform: string;
    users: number;
}

interface UserAnalyticsProps {
    dailySignups: DailySignup[];
    monthlyGrowth: MonthlyGrowth[];
    activeUsers: {
        today: number;
        week: number;
        month: number;
    };
    retention: {
        rate: number;
        mature_users: number;
        retained_users: number;
    };
    totalUsers: number;
    topDevices: DeviceStat[];
}

export default function UserAnalytics({
    dailySignups,
    monthlyGrowth,
    activeUsers,
    retention,
    totalUsers,
    topDevices,
}: UserAnalyticsProps) {
    const maxSignups = Math.max(...dailySignups.map((d) => d.count), 1);
    const maxGrowth = Math.max(...monthlyGrowth.map((d) => d.total), 1);
    const totalDeviceUsers = topDevices.reduce((acc, d) => acc + d.users, 0) || 1;

    const deviceIcons: Record<string, typeof Monitor> = {
        iOS: Smartphone,
        Android: Smartphone,
        Windows: Monitor,
        macOS: Monitor,
        Linux: Monitor,
    };

    const deviceColors: Record<string, string> = {
        iOS: 'bg-blue-500',
        Android: 'bg-green-500',
        Windows: 'bg-indigo-500',
        macOS: 'bg-slate-500',
        Linux: 'bg-orange-500',
        Other: 'bg-gray-400',
    };

    return (
        <AdminLayout>
            <Head title="User Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl border border-sidebar-border/70 p-4 md:p-6 lg:p-8">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <BarChart3 className="h-6 w-6" />
                        User Analytics
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Monitor user growth, engagement, and retention across the
                        platform.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <p className="text-3xl font-bold">{totalUsers.toLocaleString()}</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Today</p>
                                    <p className="text-3xl font-bold">{activeUsers.today}</p>
                                </div>
                                <UserCheck className="h-8 w-8 text-emerald-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active This Week</p>
                                    <p className="text-3xl font-bold">{activeUsers.week}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        30-Day Retention
                                        <HelpTooltip content="Percentage of users who signed up 30+ days ago and signed in within the last 30 days." />
                                    </p>
                                    <p className="text-3xl font-bold">{retention.rate}%</p>
                                    <p className="text-xs text-muted-foreground">
                                        {retention.retained_users} of {retention.mature_users} mature users
                                    </p>
                                </div>
                                <UserCheck className="h-8 w-8 text-violet-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Daily Signups Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Daily Signups (Last 30 Days)</CardTitle>
                            <CardDescription>New user registrations per day</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-48 items-end gap-[2px]">
                                {dailySignups.map((day, i) => (
                                    <div
                                        key={i}
                                        className="group relative flex flex-1 flex-col items-center"
                                    >
                                        <div
                                            className="w-full rounded-t bg-primary/80 transition-colors group-hover:bg-primary"
                                            style={{
                                                height: `${Math.max((day.count / maxSignups) * 100, 2)}%`,
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
                                <span>{dailySignups[0]?.date}</span>
                                <span>{dailySignups[dailySignups.length - 1]?.date}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cumulative Growth Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Cumulative Growth (6 Months)</CardTitle>
                            <CardDescription>Total user base over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-48 items-end gap-2">
                                {monthlyGrowth.map((month, i) => (
                                    <div
                                        key={i}
                                        className="group relative flex flex-1 flex-col items-center"
                                    >
                                        <div
                                            className="w-full rounded-t bg-indigo-500/80 transition-colors group-hover:bg-indigo-500"
                                            style={{
                                                height: `${Math.max((month.total / maxGrowth) * 100, 5)}%`,
                                            }}
                                        />
                                        <div className="pointer-events-none absolute -top-8 hidden rounded bg-popover px-2 py-1 text-xs shadow-md group-hover:block">
                                            <span className="font-medium">{month.total.toLocaleString()}</span>
                                        </div>
                                        <span className="mt-1 text-xs text-muted-foreground">
                                            {month.month.split(' ')[0]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Active Users Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Active Users</CardTitle>
                            <CardDescription>Unique sign-ins across time windows</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { label: 'Today', value: activeUsers.today, max: totalUsers, color: 'bg-emerald-500' },
                                    { label: 'Last 7 Days', value: activeUsers.week, max: totalUsers, color: 'bg-blue-500' },
                                    { label: 'Last 30 Days', value: activeUsers.month, max: totalUsers, color: 'bg-indigo-500' },
                                ].map((stat) => (
                                    <div key={stat.label}>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span>{stat.label}</span>
                                            <span className="font-medium">
                                                {stat.value} <span className="text-muted-foreground">/ {stat.max}</span>
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full rounded-full transition-all ${stat.color}`}
                                                style={{
                                                    width: `${stat.max > 0 ? (stat.value / stat.max) * 100 : 0}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Device Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Platform Distribution</CardTitle>
                            <CardDescription>Active user platforms (last 30 days)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topDevices.length === 0 ? (
                                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                                    No login data available yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {topDevices.map((device) => {
                                        const Icon = deviceIcons[device.platform] || Monitor;
                                        const color = deviceColors[device.platform] || 'bg-gray-400';
                                        const pct = ((device.users / totalDeviceUsers) * 100).toFixed(1);

                                        return (
                                            <div key={device.platform} className="flex items-center gap-3">
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <div className="mb-1 flex items-center justify-between text-sm">
                                                        <span>{device.platform}</span>
                                                        <span className="text-muted-foreground">{device.users} users ({pct}%)</span>
                                                    </div>
                                                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className={`h-full rounded-full ${color}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
