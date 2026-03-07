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
    CheckCircle,
    Clock,
    Key,
    Mail,
    TrendingUp,
    Users,
    Webhook,
    XCircle,
} from 'lucide-react';

interface MemberGrowthItem {
    month: string;
    joined: number;
}

interface ApiKeyItem {
    id: number;
    name: string;
    key_prefix: string;
    last_used_at: string | null;
    expires_at: string | null;
    is_expired: boolean;
    created_at: string;
}

interface WeeklyActivityItem {
    week: string;
    actions: number;
}

interface RecentActivityItem {
    id: number;
    description: string;
    event: string;
    causer_name: string;
    created_at: string;
}

interface WorkspaceAnalyticsProps {
    overview: {
        totalMembers: number;
        activeApiKeys: number;
        webhookEndpoints: number;
        activeWebhookEndpoints: number;
        pendingInvitations: number;
    };
    memberGrowth: MemberGrowthItem[];
    apiKeys: ApiKeyItem[];
    webhookDeliveries: {
        success: number;
        failed: number;
        pending: number;
        total: number;
    };
    weeklyActivity: WeeklyActivityItem[];
    recentActivity: RecentActivityItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/workspaces/settings' },
    { title: 'Analytics', href: '/workspaces/analytics' },
];

export default function WorkspaceAnalytics({
    overview,
    memberGrowth,
    apiKeys,
    webhookDeliveries,
    weeklyActivity,
    recentActivity,
}: WorkspaceAnalyticsProps) {
    const { t } = useTranslations();
    const maxWeeklyActions = Math.max(...weeklyActivity.map((w) => w.actions), 1);
    const maxGrowth = Math.max(...memberGrowth.map((m) => m.joined), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('workspace_analytics.title', 'Workspace Analytics')} />
            <SettingsLayout
                title={t('workspace_analytics.title', 'Workspace Analytics')}
                description={t('workspace_analytics.description', 'Usage metrics, resource utilization, and growth trends for your workspace.')}
                fullWidth
            >
                <div className="space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('workspace_analytics.members', 'Members')}</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overview.totalMembers}</div>
                                {overview.pendingInvitations > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {overview.pendingInvitations} {t('workspace_analytics.pending_invites', 'pending invitations')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('workspace_analytics.api_keys', 'API Keys')}</CardTitle>
                                <Key className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overview.activeApiKeys}</div>
                                <p className="text-xs text-muted-foreground">{t('workspace_analytics.active_keys', 'Active (non-expired)')}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('workspace_analytics.webhooks', 'Webhooks')}</CardTitle>
                                <Webhook className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overview.activeWebhookEndpoints}</div>
                                <p className="text-xs text-muted-foreground">
                                    {overview.webhookEndpoints} {t('workspace_analytics.total_endpoints', 'total endpoints')}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('workspace_analytics.invitations', 'Invitations')}</CardTitle>
                                <Mail className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overview.pendingInvitations}</div>
                                <p className="text-xs text-muted-foreground">{t('workspace_analytics.awaiting_response', 'Awaiting response')}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Member Growth + Weekly Activity */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Member Growth */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    {t('workspace_analytics.member_growth', 'Member Growth')}
                                </CardTitle>
                                <CardDescription>{t('workspace_analytics.member_growth_desc', 'New members joining over the last 6 months')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-2" style={{ height: 120 }}>
                                    {memberGrowth.map((item) => {
                                        const height = maxGrowth > 0 ? (item.joined / maxGrowth) * 100 : 0;

                                        return (
                                            <div
                                                key={item.month}
                                                className="group relative flex flex-1 flex-col items-center"
                                                title={`${item.month}: ${item.joined} joined`}
                                            >
                                                <div className="flex w-full flex-col items-center" style={{ height: 100 }}>
                                                    <div className="flex-1" />
                                                    <div
                                                        className="w-full max-w-[32px] rounded-t bg-blue-500/80 transition-colors group-hover:bg-blue-600"
                                                        style={{ height: `${Math.max(height, 2)}px` }}
                                                    />
                                                </div>
                                                <span className="mt-1 text-[10px] text-muted-foreground">{item.month.split(' ')[0]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Weekly Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    {t('workspace_analytics.weekly_activity', 'Weekly Activity')}
                                </CardTitle>
                                <CardDescription>{t('workspace_analytics.weekly_activity_desc', 'Activity log events over the last 8 weeks')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-2" style={{ height: 120 }}>
                                    {weeklyActivity.map((item) => {
                                        const height = maxWeeklyActions > 0 ? (item.actions / maxWeeklyActions) * 100 : 0;

                                        return (
                                            <div
                                                key={item.week}
                                                className="group relative flex flex-1 flex-col items-center"
                                                title={`${item.week}: ${item.actions} actions`}
                                            >
                                                <div className="flex w-full flex-col items-center" style={{ height: 100 }}>
                                                    <div className="flex-1" />
                                                    <div
                                                        className="w-full max-w-[32px] rounded-t bg-emerald-500/80 transition-colors group-hover:bg-emerald-600"
                                                        style={{ height: `${Math.max(height, 2)}px` }}
                                                    />
                                                </div>
                                                <span className="mt-1 text-[10px] text-muted-foreground">{item.week.split(' ')[0]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Webhook Deliveries + API Keys */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Webhook Delivery Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Webhook className="h-5 w-5" />
                                    {t('workspace_analytics.webhook_deliveries', 'Webhook Deliveries')}
                                </CardTitle>
                                <CardDescription>{t('workspace_analytics.webhook_deliveries_desc', 'Delivery status over the last 30 days')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {webhookDeliveries.total > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                {t('workspace_analytics.successful', 'Successful')}
                                            </span>
                                            <span className="font-medium">{webhookDeliveries.success}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-emerald-500"
                                                style={{ width: `${(webhookDeliveries.success / webhookDeliveries.total) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm">
                                                <XCircle className="h-4 w-4 text-red-500" />
                                                {t('workspace_analytics.failed', 'Failed')}
                                            </span>
                                            <span className="font-medium">{webhookDeliveries.failed}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-amber-500" />
                                                {t('workspace_analytics.pending', 'Pending')}
                                            </span>
                                            <span className="font-medium">{webhookDeliveries.pending}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        {t('workspace_analytics.no_webhook_deliveries', 'No webhook deliveries in the last 30 days')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* API Keys */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    {t('workspace_analytics.api_keys_list', 'API Keys')}
                                </CardTitle>
                                <CardDescription>{t('workspace_analytics.api_keys_desc', 'Recent API keys and their last usage')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {apiKeys.length > 0 ? (
                                    <div className="space-y-2">
                                        {apiKeys.map((key) => (
                                            <div key={key.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                                                <div>
                                                    <p className="text-sm font-medium">{key.name}</p>
                                                    <p className="text-xs text-muted-foreground">{key.key_prefix}...</p>
                                                </div>
                                                <div className="text-right">
                                                    {key.is_expired ? (
                                                        <Badge variant="destructive" className="text-xs">
                                                            {t('workspace_analytics.expired', 'Expired')}
                                                        </Badge>
                                                    ) : key.last_used_at ? (
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            {t('workspace_analytics.never_used', 'Never used')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        {t('workspace_analytics.no_api_keys', 'No API keys created')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                {t('workspace_analytics.recent_activity', 'Recent Activity')}
                            </CardTitle>
                            <CardDescription>
                                {t('workspace_analytics.recent_activity_desc', 'Latest events across the workspace')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentActivity.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivity.map((item) => (
                                        <div key={item.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                                            <div className="mt-0.5 rounded-full bg-muted p-1.5">
                                                <Activity className="h-3 w-3 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">{item.description}</p>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{item.causer_name}</span>
                                                    <span>&middot;</span>
                                                    <span>
                                                        {item.created_at
                                                            ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
                                                            : ''}
                                                    </span>
                                                    {item.event && (
                                                        <>
                                                            <span>&middot;</span>
                                                            <Badge variant="outline" className="text-[10px]">
                                                                {item.event}
                                                            </Badge>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    {t('workspace_analytics.no_recent_activity', 'No recent activity')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
