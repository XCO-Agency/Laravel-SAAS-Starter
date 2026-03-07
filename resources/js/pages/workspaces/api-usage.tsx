import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Activity, AlertTriangle, Clock, Gauge, ShieldAlert, Zap } from 'lucide-react';

interface DailyVolumeItem {
    date: string;
    total: number;
    throttled: number;
    errors: number;
}

interface PerKeyUsageItem {
    id: number;
    name: string;
    key_prefix: string;
    total_requests: number;
    throttled_count: number;
    avg_response_time: number;
    last_request_at: string | null;
}

interface TopEndpointItem {
    method: string;
    path: string;
    total: number;
    avg_response_time: number;
    error_count: number;
}

interface ApiUsageProps {
    overview: {
        totalRequests: number;
        throttledRequests: number;
        avgResponseTime: number;
        errorRate: number;
    };
    dailyVolume: DailyVolumeItem[];
    perKeyUsage: PerKeyUsageItem[];
    statusDistribution: Record<string, number>;
    topEndpoints: TopEndpointItem[];
    period: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/workspaces/settings' },
    { title: 'API Usage', href: '/workspaces/api-usage' },
];

const periodOptions = [
    { value: '7', label: '7 days' },
    { value: '14', label: '14 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' },
];

const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    POST: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    PUT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    PATCH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusGroupColors: Record<string, string> = {
    '2xx': 'bg-green-500',
    '3xx': 'bg-blue-500',
    '4xx': 'bg-amber-500',
    '5xx': 'bg-red-500',
    other: 'bg-gray-500',
};

export default function ApiUsage({ overview, dailyVolume, perKeyUsage, statusDistribution, topEndpoints, period }: ApiUsageProps) {
    const { t } = useTranslations();
    const maxDaily = Math.max(...dailyVolume.map((d) => d.total), 1);
    const statusTotal = Object.values(statusDistribution).reduce((sum, v) => sum + v, 0);

    const handlePeriodChange = (newPeriod: string) => {
        router.get('/workspaces/api-usage', { period: newPeriod }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('api_usage.title', 'API Usage')} />
            <SettingsLayout
                title={t('api_usage.title', 'API Usage')}
                description={t('api_usage.description', 'Monitor API request volume, response times, and per-key usage statistics.')}
                fullWidth
            >
                <div className="space-y-6">
                    {/* Period Selector */}
                    <div className="flex justify-end">
                        <div className="inline-flex items-center gap-1 rounded-lg border p-1">
                            {periodOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handlePeriodChange(opt.value)}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                        period === opt.value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('api_usage.total_requests', 'Total Requests')}
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overview.totalRequests.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {t('api_usage.last_n_days', 'Last {n} days').replace('{n}', period)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('api_usage.avg_response_time', 'Avg Response Time')}
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overview.avgResponseTime}ms</div>
                                <p className="text-xs text-muted-foreground">
                                    {t('api_usage.across_all_endpoints', 'Across all endpoints')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('api_usage.throttled', 'Throttled')}
                                </CardTitle>
                                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overview.throttledRequests.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {t('api_usage.rate_limited_requests', 'Rate-limited requests')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('api_usage.error_rate', 'Error Rate')}
                                </CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overview.errorRate}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {t('api_usage.4xx_5xx_responses', '4xx & 5xx responses')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Volume Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('api_usage.request_volume', 'Request Volume')}</CardTitle>
                            <CardDescription>
                                {t('api_usage.daily_breakdown', 'Daily request breakdown over the selected period')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dailyVolume.length === 0 ? (
                                <div className="flex h-40 items-center justify-center text-muted-foreground">
                                    {t('api_usage.no_data', 'No API requests recorded in this period.')}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {dailyVolume.map((day) => (
                                        <div key={day.date} className="flex items-center gap-3">
                                            <span className="w-20 shrink-0 text-xs text-muted-foreground">{day.date}</span>
                                            <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="absolute inset-y-0 left-0 rounded-full bg-primary/80 transition-all"
                                                    style={{ width: `${(day.total / maxDaily) * 100}%` }}
                                                />
                                                {day.errors > 0 && (
                                                    <div
                                                        className="absolute inset-y-0 rounded-full bg-red-500/60"
                                                        style={{
                                                            left: `${((day.total - day.errors) / maxDaily) * 100}%`,
                                                            width: `${(day.errors / maxDaily) * 100}%`,
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <span className="w-16 shrink-0 text-right text-xs font-medium">{day.total}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Status Code Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('api_usage.status_codes', 'Status Codes')}</CardTitle>
                                <CardDescription>
                                    {t('api_usage.response_distribution', 'Response status code distribution')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {statusTotal === 0 ? (
                                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                                        {t('api_usage.no_data', 'No API requests recorded in this period.')}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {['2xx', '3xx', '4xx', '5xx'].map((group) => {
                                            const count = statusDistribution[group] ?? 0;
                                            const pct = statusTotal > 0 ? ((count / statusTotal) * 100).toFixed(1) : '0';
                                            return (
                                                <div key={group} className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium">{group}</span>
                                                        <span className="text-muted-foreground">
                                                            {count.toLocaleString()} ({pct}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${statusGroupColors[group]}`}
                                                            style={{ width: `${(count / statusTotal) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Top Endpoints */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('api_usage.top_endpoints', 'Top Endpoints')}</CardTitle>
                                <CardDescription>
                                    {t('api_usage.most_requested', 'Most frequently requested endpoints')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {topEndpoints.length === 0 ? (
                                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                                        {t('api_usage.no_data', 'No API requests recorded in this period.')}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {topEndpoints.map((ep, i) => (
                                            <div key={i} className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <span
                                                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${methodColors[ep.method] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
                                                    >
                                                        {ep.method}
                                                    </span>
                                                    <span className="truncate text-sm font-mono">/{ep.path}</span>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                                                    <span>{ep.total.toLocaleString()} req</span>
                                                    <span>{ep.avg_response_time}ms</span>
                                                    {ep.error_count > 0 && (
                                                        <span className="text-red-500">{ep.error_count} err</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Per-Key Usage Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('api_usage.per_key_usage', 'Per-Key Usage')}</CardTitle>
                            <CardDescription>
                                {t('api_usage.breakdown_by_key', 'Request breakdown by API key')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {perKeyUsage.length === 0 ? (
                                <div className="flex h-32 items-center justify-center text-muted-foreground">
                                    {t('api_usage.no_keys_data', 'No API key usage recorded in this period.')}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left">
                                                <th className="pb-2 font-medium">{t('api_usage.key_name', 'Key')}</th>
                                                <th className="pb-2 font-medium">{t('api_usage.prefix', 'Prefix')}</th>
                                                <th className="pb-2 text-right font-medium">{t('api_usage.requests', 'Requests')}</th>
                                                <th className="pb-2 text-right font-medium">{t('api_usage.throttled_header', 'Throttled')}</th>
                                                <th className="pb-2 text-right font-medium">{t('api_usage.avg_time', 'Avg Time')}</th>
                                                <th className="pb-2 text-right font-medium">{t('api_usage.last_request', 'Last Request')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {perKeyUsage.map((key) => (
                                                <tr key={key.id}>
                                                    <td className="py-2 font-medium">{key.name}</td>
                                                    <td className="py-2 font-mono text-xs text-muted-foreground">{key.key_prefix}...</td>
                                                    <td className="py-2 text-right">{key.total_requests.toLocaleString()}</td>
                                                    <td className="py-2 text-right">
                                                        {key.throttled_count > 0 ? (
                                                            <span className="text-amber-600 dark:text-amber-400">{key.throttled_count}</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">0</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 text-right">{key.avg_response_time}ms</td>
                                                    <td className="py-2 text-right text-xs text-muted-foreground">
                                                        {key.last_request_at
                                                            ? new Date(key.last_request_at).toLocaleDateString()
                                                            : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
