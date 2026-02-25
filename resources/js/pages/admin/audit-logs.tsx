import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ChevronDown,
    ChevronRight,
    ScrollText,
    Search,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

interface Causer {
    id: number;
    name: string;
}

interface ActivityItem {
    id: number;
    log_name: string | null;
    description: string;
    event: string | null;
    subject_type: string | null;
    subject_id: number | null;
    causer: Causer | null;
    properties: Record<string, unknown> | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AuditLogsProps {
    activities: {
        data: ActivityItem[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string;
        log_name: string;
        event: string;
    };
    logNames: string[];
    events: string[];
}

const EVENT_COLORS: Record<string, string> = {
    created: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function PropertyViewer({ properties }: { properties: Record<string, unknown> }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div>
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Properties
            </button>
            {expanded && (
                <pre className="mt-1 text-xs bg-muted/50 rounded p-2 max-h-32 overflow-auto">
                    {JSON.stringify(properties, null, 2)}
                </pre>
            )}
        </div>
    );
}

export default function AuditLogs({ activities, filters, logNames, events }: AuditLogsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [logName, setLogName] = useState(filters.log_name || '');
    const [event, setEvent] = useState(filters.event || '');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/audit-logs', { search, log_name: logName, event }, { preserveState: true, replace: true });
    };

    const handleFilter = (field: string, value: string) => {
        const params: Record<string, string> = { search, log_name: logName, event };
        params[field] = value;
        if (field === 'log_name') setLogName(value);
        if (field === 'event') setEvent(value);
        router.get('/admin/audit-logs', params, { preserveState: true, replace: true });
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AdminLayout>
            <Head title="Audit Logs" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 rounded-xl border border-sidebar-border/70">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <ScrollText className="h-6 w-6" />
                            Audit Logs
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {activities.total} activit{activities.total !== 1 ? 'ies' : 'y'} recorded
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-48 pl-9"
                                />
                            </div>
                            <Button type="submit" size="sm">Search</Button>
                        </form>
                        <select
                            value={logName}
                            onChange={e => handleFilter('log_name', e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="">All Logs</option>
                            {logNames.map(ln => (
                                <option key={ln} value={ln}>{ln}</option>
                            ))}
                        </select>
                        <select
                            value={event}
                            onChange={e => handleFilter('event', e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="">All Events</option>
                            {events.map(ev => (
                                <option key={ev} value={ev}>{ev}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 font-medium">When</th>
                                <th className="px-4 py-3 font-medium">Event</th>
                                <th className="px-4 py-3 font-medium">Description</th>
                                <th className="px-4 py-3 font-medium">Subject</th>
                                <th className="px-4 py-3 font-medium">By</th>
                                <th className="px-4 py-3 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {activities.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                        No audit logs found.
                                    </td>
                                </tr>
                            ) : (
                                activities.data.map(activity => (
                                    <tr key={activity.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                            {formatTime(activity.created_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {activity.event && (
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${EVENT_COLORS[activity.event] || 'bg-muted text-muted-foreground'}`}>
                                                    {activity.event}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate" title={activity.description}>
                                            {activity.description}
                                        </td>
                                        <td className="px-4 py-3">
                                            {activity.subject_type && (
                                                <Badge variant="outline" className="text-[10px]">
                                                    {activity.subject_type}
                                                    {activity.subject_id && ` #${activity.subject_id}`}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {activity.causer ? (
                                                <span className="font-medium">{activity.causer.name}</span>
                                            ) : (
                                                <span className="text-muted-foreground italic">System</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {activity.properties && (
                                                <PropertyViewer properties={activity.properties} />
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {activities.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {activities.links.map((link, i) => (
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
