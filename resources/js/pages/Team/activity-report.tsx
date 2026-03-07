import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    Activity,
    BarChart3,
    Clock,
    LogIn,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';

interface MemberActivity {
    id: number;
    name: string;
    email: string;
    role: string;
    joined_at: string | null;
    last_login: string | null;
    last_active: string | null;
    logins_30d: number;
    actions_30d: number;
    engagement_score: number;
    status: 'online' | 'recent' | 'inactive';
}

interface DailyActivityItem {
    date: string;
    actions: number;
    logins: number;
}

interface ActivityReportProps {
    members: MemberActivity[];
    summary: {
        totalMembers: number;
        activeMembers: number;
        averageEngagement: number;
        totalActions30d: number;
    };
    dailyActivity: DailyActivityItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/workspaces/settings' },
    { title: 'Team', href: '/team' },
    { title: 'Member Activity', href: '/team/activity-report' },
];

const statusConfig = {
    online: { label: 'Online', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
    recent: { label: 'Recent', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
    inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
};

function EngagementBar({ score }: { score: number }) {
    const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-400';

    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className="text-xs font-medium tabular-nums">{score}</span>
        </div>
    );
}

export default function ActivityReport({ members, summary, dailyActivity }: ActivityReportProps) {
    const { t } = useTranslations();
    const maxDailyActions = Math.max(...dailyActivity.map((d) => d.actions + d.logins), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('member_activity.title', 'Member Activity Report')} />
            <SettingsLayout
                title={t('member_activity.title', 'Member Activity Report')}
                description={t('member_activity.description', 'View member engagement, login frequency, and activity metrics for your workspace.')}
                fullWidth
            >
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('member_activity.total_members', 'Total Members')}</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.totalMembers}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('member_activity.active_members', 'Active Members')}</CardTitle>
                                <Activity className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.activeMembers}</div>
                                <p className="text-xs text-muted-foreground">
                                    {summary.totalMembers > 0
                                        ? `${Math.round((summary.activeMembers / summary.totalMembers) * 100)}% ${t('member_activity.of_total', 'of total')}`
                                        : t('member_activity.no_members', 'No members')}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('member_activity.avg_engagement', 'Avg Engagement')}</CardTitle>
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.averageEngagement}</div>
                                <p className="text-xs text-muted-foreground">{t('member_activity.out_of_100', 'Out of 100')}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('member_activity.actions_30d', 'Actions (30d)')}</CardTitle>
                                <Zap className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.totalActions30d}</div>
                                <p className="text-xs text-muted-foreground">
                                    {summary.totalMembers > 0
                                        ? `~${Math.round(summary.totalActions30d / summary.totalMembers)} ${t('member_activity.per_member', 'per member')}`
                                        : ''}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Activity Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                {t('member_activity.daily_activity', 'Daily Activity')}
                            </CardTitle>
                            <CardDescription>{t('member_activity.daily_activity_desc', 'Actions and logins over the last 14 days')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-1" style={{ height: 120 }}>
                                {dailyActivity.map((day) => {
                                    const totalHeight = ((day.actions + day.logins) / maxDailyActions) * 100;
                                    const loginHeight = maxDailyActions > 0 ? (day.logins / maxDailyActions) * 100 : 0;
                                    const actionHeight = maxDailyActions > 0 ? (day.actions / maxDailyActions) * 100 : 0;
                                    const date = new Date(day.date);
                                    const label = `${date.getMonth() + 1}/${date.getDate()}`;

                                    return (
                                        <div
                                            key={day.date}
                                            className="group relative flex flex-1 flex-col items-center"
                                            title={`${day.date}: ${day.actions} actions, ${day.logins} logins`}
                                        >
                                            <div className="flex w-full flex-col items-center" style={{ height: 100 }}>
                                                <div className="flex-1" />
                                                <div className="flex w-full flex-col items-center">
                                                    <div
                                                        className="w-full max-w-[20px] rounded-t bg-emerald-500/80"
                                                        style={{ height: `${actionHeight}px` }}
                                                    />
                                                    <div
                                                        className="w-full max-w-[20px] rounded-b bg-blue-500/80"
                                                        style={{ height: `${loginHeight}px` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="mt-1 text-[10px] text-muted-foreground">{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <span className="inline-block h-2 w-2 rounded bg-emerald-500/80" /> {t('member_activity.actions', 'Actions')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-block h-2 w-2 rounded bg-blue-500/80" /> {t('member_activity.logins', 'Logins')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Member Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                {t('member_activity.member_details', 'Member Details')}
                            </CardTitle>
                            <CardDescription>
                                {t('member_activity.member_details_desc', 'Individual member engagement metrics for the last 30 days')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">{t('member_activity.member', 'Member')}</th>
                                            <th className="pb-3 font-medium">{t('member_activity.role', 'Role')}</th>
                                            <th className="pb-3 font-medium">{t('member_activity.status', 'Status')}</th>
                                            <th className="pb-3 font-medium">{t('member_activity.last_login', 'Last Login')}</th>
                                            <th className="pb-3 text-center font-medium">{t('member_activity.logins', 'Logins')}</th>
                                            <th className="pb-3 text-center font-medium">{t('member_activity.actions', 'Actions')}</th>
                                            <th className="pb-3 font-medium">{t('member_activity.engagement', 'Engagement')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((member) => {
                                            const statusCfg = statusConfig[member.status];

                                            return (
                                                <tr key={member.id} className="border-b last:border-0">
                                                    <td className="py-3">
                                                        <div>
                                                            <p className="font-medium">{member.name}</p>
                                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge variant="outline" className="capitalize">
                                                            {member.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge className={statusCfg.className}>
                                                            {statusCfg.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 text-muted-foreground">
                                                        {member.last_login ? (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDistanceToNow(new Date(member.last_login), { addSuffix: true })}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs">{t('member_activity.never', 'Never')}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <span className="flex items-center justify-center gap-1">
                                                            <LogIn className="h-3 w-3 text-muted-foreground" />
                                                            {member.logins_30d}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        {member.actions_30d}
                                                    </td>
                                                    <td className="py-3">
                                                        <EngagementBar score={member.engagement_score} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {members.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                    {t('member_activity.no_members_found', 'No members found.')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
