import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    ArrowDownRight,
    ArrowUpRight,
    Building2,
    CreditCard,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';

interface Metrics {
    total_users: number;
    total_workspaces: number;
    active_subscriptions: number;
    new_users_30d: number;
    user_growth_percent: number;
    workspace_growth_percent: number;
}

interface DailySignup {
    date: string;
    count: number;
}

interface PlanDistItem {
    plan: string;
    count: number;
}

interface AdminDashboardProps {
    metrics: Metrics;
    dailySignups: DailySignup[];
    planDistribution: PlanDistItem[];
    recent_users: {
        id: number;
        name: string;
        email: string;
        created_at: string;
    }[];
}

function GrowthBadge({ value }: { value: number }) {
    const isPositive = value >= 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(value)}%
        </span>
    );
}

function Sparkline({ data, className = '' }: { data: number[]; className?: string }) {
    if (data.length === 0) return null;
    const max = Math.max(...data, 1);
    const width = 120;
    const height = 32;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (v / max) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className={`${className}`} preserveAspectRatio="none">
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function MetricCard({ title, value, icon: Icon, growth, sparkData }: {
    title: string;
    value: string | number;
    icon: typeof Users;
    growth?: number;
    sparkData?: number[];
}) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 flex items-end justify-between">
                    <div>
                        <p className="text-2xl font-bold">{value}</p>
                        {growth !== undefined && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                <GrowthBadge value={growth} /> vs last 30d
                            </p>
                        )}
                    </div>
                    {sparkData && (
                        <Sparkline data={sparkData} className="h-8 w-20 text-primary/60" />
                    )}
                </div>
            </div>
        </div>
    );
}

const PLAN_COLORS = [
    'bg-zinc-200 dark:bg-zinc-700',
    'bg-primary/70',
    'bg-primary',
    'bg-primary/40',
];

export default function AdminDashboard({ metrics, dailySignups, planDistribution, recent_users }: AdminDashboardProps) {
    const signupCounts = dailySignups.map(d => d.count);
    const totalPlanCount = planDistribution.reduce((sum, p) => sum + p.count, 0) || 1;

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
                    <p className="text-muted-foreground text-sm">Monitor platform metrics across all workspaces.</p>
                </div>

                {/* Metric Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Total Users"
                        value={metrics.total_users}
                        icon={Users}
                        growth={metrics.user_growth_percent}
                        sparkData={signupCounts}
                    />
                    <MetricCard
                        title="Total Workspaces"
                        value={metrics.total_workspaces}
                        icon={Building2}
                        growth={metrics.workspace_growth_percent}
                    />
                    <MetricCard
                        title="Active Subscriptions"
                        value={metrics.active_subscriptions}
                        icon={CreditCard}
                    />
                    <MetricCard
                        title="New Users (30d)"
                        value={metrics.new_users_30d}
                        icon={UserPlus}
                        sparkData={signupCounts}
                    />
                </div>

                {/* Middle Row: Signup Trend + Plan Distribution */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Daily Signups Chart */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 pb-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">Daily Signups (14d)</h3>
                            </div>
                        </div>
                        <div className="px-6 pb-6">
                            <div className="flex items-end gap-1" style={{ height: '120px' }}>
                                {dailySignups.map((day, i) => {
                                    const maxCount = Math.max(...signupCounts, 1);
                                    const heightPercent = (day.count / maxCount) * 100;
                                    return (
                                        <div
                                            key={i}
                                            className="group relative flex-1 flex flex-col items-center"
                                        >
                                            <div
                                                className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors min-h-[2px]"
                                                style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                            />
                                            <span className="text-[9px] text-muted-foreground mt-1 hidden lg:block">
                                                {day.date.split(' ')[1]}
                                            </span>
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {day.date}: {day.count}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Plan Distribution */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 pb-2">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">Plan Distribution</h3>
                            </div>
                        </div>
                        <div className="px-6 pb-6 space-y-3">
                            {/* Stacked bar */}
                            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                                {planDistribution.map((p, i) => (
                                    <div
                                        key={p.plan}
                                        className={`${PLAN_COLORS[i % PLAN_COLORS.length]} transition-all`}
                                        style={{ width: `${(p.count / totalPlanCount) * 100}%` }}
                                    />
                                ))}
                            </div>
                            {/* Legend */}
                            <div className="space-y-2">
                                {planDistribution.map((p, i) => (
                                    <div key={p.plan} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-block h-2.5 w-2.5 rounded-full ${PLAN_COLORS[i % PLAN_COLORS.length]}`} />
                                            <span>{p.plan}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{p.count}</span>
                                            <span className="text-muted-foreground text-xs">
                                                ({Math.round((p.count / totalPlanCount) * 100)}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold tracking-tight">Recent Users</h3>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/users">View All Users →</Link>
                        </Button>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">Email</th>
                                    <th className="px-6 py-3 font-medium">Joined</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {recent_users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    recent_users.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{user.name}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => router.post(`/admin/impersonate/${user.id}`)}
                                                >
                                                    Impersonate
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
