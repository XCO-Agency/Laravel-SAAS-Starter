import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    DollarSign,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Metrics {
    total_users: number;
    total_workspaces: number;
    active_subscriptions: number;
    new_users_30d: number;
    user_growth_percent: number;
    workspace_growth_percent: number;
    mrr: number;
    churn_rate: number;
}

interface DailyStat {
    date: string;
    count: number;
}

interface PlanDistItem {
    plan: string;
    count: number;
}

interface AdminDashboardProps {
    metrics: Metrics;
    dailySignups: DailyStat[];
    dailyWorkspaces: DailyStat[];
    planDistribution: PlanDistItem[];
    recent_users: {
        id: number;
        name: string;
        email: string;
        created_at: string;
    }[];
}

function GrowthBadge({ value, invertColors = false }: { value: number, invertColors?: boolean }) {
    const isPositive = value >= 0;

    // For churn, negative growth is good (green), positive growth is bad (red)
    const healthyClass = 'text-emerald-600 dark:text-emerald-400';
    const unhealthyClass = 'text-red-600 dark:text-red-400';

    const colorClass = invertColors
        ? (isPositive ? unhealthyClass : healthyClass)
        : (isPositive ? healthyClass : unhealthyClass);

    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${colorClass}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(value)}%
        </span>
    );
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--primary) / 0.7)', 'hsl(var(--primary) / 0.4)', 'hsl(var(--muted))'];

export default function AdminDashboard({ metrics, dailySignups, dailyWorkspaces, planDistribution, recent_users }: AdminDashboardProps) {
    // Combine daily stats for the multi-line chart
    const combinedDailyStats = dailySignups.map((signupDay, index) => {
        const workspaceDay = dailyWorkspaces[index] || { count: 0 };
        return {
            date: signupDay.date,
            users: signupDay.count,
            workspaces: workspaceDay.count,
        };
    }).reverse(); // Reverse to show chronological order left-to-right

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
                    <p className="text-muted-foreground text-sm">Monitor platform metrics across all workspaces.</p>
                </div>

                {/* Top Metric Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(metrics.mrr)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                From active subscriptions
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.active_subscriptions}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Paying and trialing workspaces
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Churn Rate (30d)</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.churn_rate}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Subscriber retention health
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.total_users}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <GrowthBadge value={metrics.user_growth_percent} /> from previous 30d
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Second Row: Charts */}
                <div className="grid gap-4 md:grid-cols-7">
                    {/* Growth Chart */}
                    <Card className="md:col-span-4">
                        <CardHeader>
                            <CardTitle>Platform Growth</CardTitle>
                            <CardDescription>
                                Daily new users and workspaces over the last 14 days
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={combinedDailyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorWorkspaces" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="date"
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                        <Area
                                            type="monotone"
                                            dataKey="users"
                                            name="New Users"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorUsers)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="workspaces"
                                            name="New Workspaces"
                                            stroke="hsl(var(--foreground))"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorWorkspaces)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Plan Distribution */}
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle>Plan Distribution</CardTitle>
                            <CardDescription>
                                Active workspace subscriptions across pricing tiers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={planDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="count"
                                            nameKey="plan"
                                        >
                                            {planDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            formatter={(value: any, name: any) => [`${value} Workspaces`, name]}
                                        />
                                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
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
