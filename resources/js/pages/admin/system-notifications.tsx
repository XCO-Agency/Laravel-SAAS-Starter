import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    Bell,
    CheckCheck,
    Info,
    ShieldAlert,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface NotificationItem {
    id: number;
    type: string;
    severity: string;
    title: string;
    message: string;
    metadata: Record<string, unknown> | null;
    read_at: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface SystemNotificationsProps {
    notifications: {
        data: NotificationItem[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        type: string;
        severity: string;
        status: string;
    };
    summary: {
        total: number;
        unread: number;
        critical: number;
        warning: number;
    };
    types: string[];
    severities: string[];
}

const SEVERITY_STYLES: Record<string, { badge: string; icon: typeof Info }> = {
    info: {
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Info,
    },
    warning: {
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        icon: AlertTriangle,
    },
    critical: {
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle,
    },
};

const TYPE_LABELS: Record<string, string> = {
    webhook_failure: 'Webhook Failure',
    subscription_canceled: 'Subscription Canceled',
    subscription_past_due: 'Subscription Past Due',
    system_error: 'System Error',
    new_signup: 'New Signup',
};

function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatRelative(iso: string): string {
    const now = Date.now();
    const diff = now - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatTime(iso);
}

export default function SystemNotifications({ notifications, filters, summary, types, severities }: SystemNotificationsProps) {
    const [type, setType] = useState(filters.type || '');
    const [severity, setSeverity] = useState(filters.severity || '');
    const [status, setStatus] = useState(filters.status || '');

    const applyFilter = (field: string, value: string) => {
        const params: Record<string, string> = { type, severity, status };
        params[field] = value;
        if (field === 'type') setType(value);
        if (field === 'severity') setSeverity(value);
        if (field === 'status') setStatus(value);
        router.get('/admin/system-notifications', params, { preserveState: true, replace: true });
    };

    const markAsRead = (id: number) => {
        router.patch(`/admin/system-notifications/${id}/read`, {}, { preserveState: true });
    };

    const markAllAsRead = () => {
        router.patch('/admin/system-notifications/read-all', {}, { preserveState: true });
    };

    const deleteNotification = (id: number) => {
        router.delete(`/admin/system-notifications/${id}`, { preserveState: true });
    };

    const selectClass = 'h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

    return (
        <AdminLayout>
            <Head title="System Alerts" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 rounded-xl border border-sidebar-border/70">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <ShieldAlert className="h-6 w-6" />
                            System Alerts
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {summary.unread} unread of {summary.total} total notification{summary.total !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {summary.unread > 0 && (
                            <Button variant="outline" size="sm" onClick={markAllAsRead}>
                                <CheckCheck className="mr-1.5 h-4 w-4" />
                                Mark All Read
                            </Button>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Bell className="h-4 w-4" />
                            Total
                        </div>
                        <p className="mt-1 text-2xl font-bold">{summary.total}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Info className="h-4 w-4" />
                            Unread
                        </div>
                        <p className="mt-1 text-2xl font-bold">{summary.unread}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <XCircle className="h-4 w-4" />
                            Critical
                        </div>
                        <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{summary.critical}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="h-4 w-4" />
                            Warnings
                        </div>
                        <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.warning}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    <select value={type} onChange={e => applyFilter('type', e.target.value)} className={selectClass}>
                        <option value="">All Types</option>
                        {types.map(t => (
                            <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
                        ))}
                    </select>
                    <select value={severity} onChange={e => applyFilter('severity', e.target.value)} className={selectClass}>
                        <option value="">All Severities</option>
                        {severities.map(s => (
                            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                    <select value={status} onChange={e => applyFilter('status', e.target.value)} className={selectClass}>
                        <option value="">All Status</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>
                </div>

                {/* Notification List */}
                <div className="space-y-3">
                    {notifications.data.length === 0 ? (
                        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                            <ShieldAlert className="mx-auto h-10 w-10 mb-3 opacity-50" />
                            <p className="text-lg font-medium">No notifications found</p>
                            <p className="text-sm mt-1">System alerts will appear here when events occur.</p>
                        </div>
                    ) : (
                        notifications.data.map(notification => {
                            const style = SEVERITY_STYLES[notification.severity] || SEVERITY_STYLES.info;
                            const SeverityIcon = style.icon;
                            const isUnread = !notification.read_at;

                            return (
                                <div
                                    key={notification.id}
                                    className={`rounded-xl border bg-card p-4 shadow-sm transition-colors ${isUnread ? 'border-l-4 border-l-primary' : 'opacity-75'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            <SeverityIcon className={`h-5 w-5 ${
                                                notification.severity === 'critical' ? 'text-red-500' :
                                                notification.severity === 'warning' ? 'text-amber-500' :
                                                'text-blue-500'
                                            }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className={`text-sm font-semibold ${isUnread ? '' : 'text-muted-foreground'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${style.badge}`}>
                                                    {notification.severity}
                                                </span>
                                                <Badge variant="outline" className="text-[10px]">
                                                    {TYPE_LABELS[notification.type] || notification.type}
                                                </Badge>
                                                {isUnread && (
                                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                                            <p className="mt-1 text-xs text-muted-foreground/70">{formatRelative(notification.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {isUnread && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markAsRead(notification.id)}
                                                    title="Mark as read"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <CheckCheck className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteNotification(notification.id)}
                                                title="Delete"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {notifications.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
