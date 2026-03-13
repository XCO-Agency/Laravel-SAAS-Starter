import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useState } from 'react';

interface ApiRequestLogItem {
    id: number;
    method: string;
    path: string;
    status_code: number;
    response_time_ms: number | null;
    was_throttled: boolean;
    ip_address: string | null;
    requested_at: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface ApiRequestLogsProps {
    logs: {
        data: ApiRequestLogItem[];
        links: PaginationLinks[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters: {
        method: string | null;
        status: string | null;
        path: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/workspaces/settings' },
    { title: 'API Usage', href: '/workspaces/api-usage' },
    { title: 'Request Logs', href: '/workspaces/api-usage/logs' },
];

const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    POST: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    PUT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    PATCH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function statusColor(code: number): string {
    if (code >= 500) return 'text-red-600 dark:text-red-400';
    if (code >= 400) return 'text-amber-600 dark:text-amber-400';
    if (code >= 300) return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
}

export default function ApiRequestLogs({ logs, filters }: ApiRequestLogsProps) {
    const { t } = useTranslations();
    const [pathInput, setPathInput] = useState(filters.path ?? '');

    const applyFilters = (overrides: Partial<typeof filters>) => {
        const merged = { ...filters, ...overrides };
        router.get(
            '/workspaces/api-usage/logs',
            Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== null && v !== '')),
            { preserveState: true, preserveScroll: true },
        );
    };

    const clearFilters = () => {
        setPathInput('');
        router.get('/workspaces/api-usage/logs', {}, { preserveState: false });
    };

    const hasActiveFilters = filters.method || filters.status || filters.path;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('api_usage.request_logs', 'API Request Logs')} />
            <SettingsLayout
                title={t('api_usage.request_logs', 'API Request Logs')}
                description={t('api_usage.request_logs_description', 'Browse raw API request history for this workspace.')}
                fullWidth
            >
                <div className="space-y-6">
                    {/* Back + Filters */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button variant="outline" size="sm" asChild className="w-fit">
                            <Link href="/workspaces/api-usage">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('api_usage.back_to_overview', 'Back to Overview')}
                            </Link>
                        </Button>

                        <div className="flex flex-1 flex-wrap items-center gap-2">
                            {/* Method filter */}
                            <Select
                                value={filters.method ?? 'all'}
                                onValueChange={(v) => applyFilters({ method: v === 'all' ? null : v })}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder={t('api_usage.method', 'Method')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('api_usage.all_methods', 'All Methods')}</SelectItem>
                                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status filter */}
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(v) => applyFilters({ status: v === 'all' ? null : v })}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder={t('api_usage.status', 'Status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('api_usage.all_statuses', 'All Statuses')}</SelectItem>
                                    <SelectItem value="2xx">2xx</SelectItem>
                                    <SelectItem value="3xx">3xx</SelectItem>
                                    <SelectItem value="4xx">4xx</SelectItem>
                                    <SelectItem value="5xx">5xx</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Path search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-8"
                                    placeholder={t('api_usage.search_path', 'Search path…')}
                                    value={pathInput}
                                    onChange={(e) => setPathInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') applyFilters({ path: pathInput || null });
                                    }}
                                />
                            </div>

                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="mr-1 h-4 w-4" />
                                    {t('api_usage.clear_filters', 'Clear')}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Logs Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('api_usage.request_logs', 'Request Logs')}</CardTitle>
                            <CardDescription>
                                {logs.total} {t('api_usage.total_requests_found', 'requests found')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {logs.data.length === 0 ? (
                                <div className="flex h-40 items-center justify-center text-muted-foreground">
                                    {t('api_usage.no_logs', 'No request logs found.')}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left">
                                                <th className="pb-2 font-medium">{t('api_usage.method', 'Method')}</th>
                                                <th className="pb-2 font-medium">{t('api_usage.path_header', 'Path')}</th>
                                                <th className="pb-2 text-right font-medium">{t('api_usage.status', 'Status')}</th>
                                                <th className="pb-2 text-right font-medium">{t('api_usage.latency', 'Latency')}</th>
                                                <th className="pb-2 text-right font-medium">{t('api_usage.ip', 'IP')}</th>
                                                <th className="pb-2 text-right font-medium">{t('api_usage.time', 'Time')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {logs.data.map((log) => (
                                                <tr key={log.id} className="group hover:bg-muted/30">
                                                    <td className="py-2">
                                                        <span
                                                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${methodColors[log.method] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
                                                        >
                                                            {log.method}
                                                        </span>
                                                        {log.was_throttled && (
                                                            <span className="ml-1.5 rounded bg-amber-100 px-1 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                                throttled
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="max-w-xs py-2">
                                                        <span className="truncate font-mono text-xs">/{log.path}</span>
                                                    </td>
                                                    <td className={`py-2 text-right font-mono font-semibold ${statusColor(log.status_code)}`}>
                                                        {log.status_code}
                                                    </td>
                                                    <td className="py-2 text-right text-xs text-muted-foreground">
                                                        {log.response_time_ms !== null ? `${log.response_time_ms}ms` : '—'}
                                                    </td>
                                                    <td className="py-2 text-right font-mono text-xs text-muted-foreground">
                                                        {log.ip_address ?? '—'}
                                                    </td>
                                                    <td className="py-2 text-right text-xs text-muted-foreground">
                                                        {new Date(log.requested_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <Pagination>
                            <PaginationContent>
                                {logs.links.map((link, i) => {
                                    if (link.label.includes('Previous')) {
                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationPrevious
                                                    href={link.url ?? '#'}
                                                    aria-disabled={!link.url}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (link.url) router.get(link.url, {}, { preserveState: true });
                                                    }}
                                                />
                                            </PaginationItem>
                                        );
                                    }
                                    if (link.label.includes('Next')) {
                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationNext
                                                    href={link.url ?? '#'}
                                                    aria-disabled={!link.url}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (link.url) router.get(link.url, {}, { preserveState: true });
                                                    }}
                                                />
                                            </PaginationItem>
                                        );
                                    }
                                    return (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                href={link.url ?? '#'}
                                                isActive={link.active}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (link.url) router.get(link.url, {}, { preserveState: true });
                                                }}
                                            >
                                                {link.label}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
