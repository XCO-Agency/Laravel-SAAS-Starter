import React, { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bug, Lightbulb, MessageCircle, Trash2, CheckCheck, Archive, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackUser {
    id: number;
    name: string;
    email: string;
}

interface FeedbackWorkspace {
    id: number;
    name: string;
}

interface FeedbackItem {
    id: number;
    type: 'bug' | 'idea' | 'general';
    message: string;
    status: 'new' | 'reviewed' | 'archived';
    page_url: string | null;
    created_at: string;
    user: FeedbackUser | null;
    workspace: FeedbackWorkspace | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    feedback: {
        data: FeedbackItem[];
        links: PaginationLink[];
        total: number;
        last_page: number;
    };
    filters: { type?: string; status?: string };
    counts: { new: number; reviewed: number; archived: number };
}

const TYPE_CONFIG = {
    bug: { label: 'Bug', icon: Bug, color: 'text-red-500', badge: 'destructive' as const },
    idea: { label: 'Idea', icon: Lightbulb, color: 'text-amber-500', badge: 'secondary' as const },
    general: { label: 'General', icon: MessageCircle, color: 'text-blue-500', badge: 'outline' as const },
};

const STATUS_CONFIG = {
    new: { label: 'New', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    reviewed: { label: 'Reviewed', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
    archived: { label: 'Archived', className: 'bg-muted text-muted-foreground' },
};

export default function AdminFeedback({ feedback, filters, counts }: Props) {
    const [typeFilter, setTypeFilter] = useState(filters.type ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    const applyFilters = (newType: string, newStatus: string) => {
        router.get('/admin/feedback', { type: newType || undefined, status: newStatus || undefined }, { preserveState: true });
    };

    const setStatus = (item: FeedbackItem, status: string) => {
        router.put(`/admin/feedback/${item.id}`, { status }, { preserveScroll: true });
    };

    const destroy = (item: FeedbackItem) => {
        if (confirm('Delete this feedback submission?')) {
            router.delete(`/admin/feedback/${item.id}`, { preserveScroll: true });
        }
    };

    const totalAll = counts.new + counts.reviewed + counts.archived;

    const STATUS_TABS = [
        { value: '', label: 'All', count: totalAll },
        { value: 'new', label: 'New', count: counts.new },
        { value: 'reviewed', label: 'Reviewed', count: counts.reviewed },
        { value: 'archived', label: 'Archived', count: counts.archived },
    ];

    return (
        <AdminLayout>
            <Head title="User Feedback" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 rounded-xl border border-sidebar-border/70">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <MessageCircle className="h-6 w-6" />
                            User Feedback
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {feedback.total} submission{feedback.total !== 1 ? 's' : ''} from users
                        </p>
                    </div>
                    {/* Type filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); applyFilters(e.target.value, statusFilter); }}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="bug">🐛 Bug Reports</option>
                        <option value="idea">💡 Feature Ideas</option>
                        <option value="general">💬 General</option>
                    </select>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-1 border-b">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => { setStatusFilter(tab.value); applyFilters(typeFilter, tab.value); }}
                            className={cn(
                                'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                                statusFilter === tab.value
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {tab.label}
                            <span className={cn(
                                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                statusFilter === tab.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Table */}
                {feedback.data.length === 0 ? (
                    <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                        No feedback submissions match the current filter.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {feedback.data.map((item) => {
                            const typeConf = TYPE_CONFIG[item.type];
                            const statusConf = STATUS_CONFIG[item.status];
                            const Icon = typeConf.icon;

                            return (
                                <div key={item.id} className="flex gap-4 rounded-xl border bg-card p-4">
                                    <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', typeConf.color)} />
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant={typeConf.badge} className="text-[10px]">{typeConf.label}</Badge>
                                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', statusConf.className)}>
                                                {statusConf.label}
                                            </span>
                                            {item.user && (
                                                <span className="text-xs text-muted-foreground">
                                                    {item.user.name} · {item.user.email}
                                                </span>
                                            )}
                                            {item.workspace && (
                                                <span className="text-xs text-muted-foreground">· {item.workspace.name}</span>
                                            )}
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{item.message}</p>
                                        {item.page_url && (
                                            <a
                                                href={item.page_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                {item.page_url}
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-1 shrink-0">
                                        {item.status !== 'reviewed' && (
                                            <Button variant="ghost" size="icon" title="Mark Reviewed" onClick={() => setStatus(item, 'reviewed')}>
                                                <CheckCheck className="h-4 w-4 text-emerald-600" />
                                            </Button>
                                        )}
                                        {item.status !== 'archived' && (
                                            <Button variant="ghost" size="icon" title="Archive" onClick={() => setStatus(item, 'archived')}>
                                                <Archive className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" title="Delete" className="text-destructive" onClick={() => destroy(item)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {feedback.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {feedback.links.map((link, i) => (
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
