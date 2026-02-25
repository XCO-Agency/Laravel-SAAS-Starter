import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertCircle,
    CheckCircle,
    Info,
    Megaphone,
    Plus,
    ToggleLeft,
    ToggleRight,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface AnnouncementItem {
    id: number;
    title: string;
    body: string;
    type: string;
    is_active: boolean;
    is_dismissible: boolean;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    announcements: {
        data: AnnouncementItem[];
        links: PaginationLink[];
        total: number;
        last_page: number;
    };
}

const TYPE_ICONS: Record<string, typeof Info> = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle,
    danger: XCircle,
};

const TYPE_COLORS: Record<string, string> = {
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-amber-600 dark:text-amber-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    danger: 'text-red-600 dark:text-red-400',
};

export default function AdminAnnouncements({ announcements }: Props) {
    const [showForm, setShowForm] = useState(false);

    const form = useForm({
        title: '',
        body: '',
        type: 'info',
        link_text: '',
        link_url: '',
        is_active: true,
        is_dismissible: true,
        starts_at: '',
        ends_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/announcements', {
            onSuccess: () => {
                form.reset();
                setShowForm(false);
            },
            preserveScroll: true,
        });
    };

    const toggleAnnouncement = (id: number) => {
        router.post(`/admin/announcements/${id}/toggle`, {}, { preserveScroll: true });
    };

    const deleteAnnouncement = (a: AnnouncementItem) => {
        if (confirm(`Delete announcement "${a.title}"?`)) {
            router.delete(`/admin/announcements/${a.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Announcements" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 rounded-xl border border-sidebar-border/70">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Megaphone className="h-6 w-6" />
                            Announcements
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage global banners shown to all users
                        </p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)} size="sm">
                        <Plus className="mr-1.5 h-4 w-4" />
                        New Announcement
                    </Button>
                </div>

                {/* Create Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium">Title *</label>
                                <Input
                                    value={form.data.title}
                                    onChange={e => form.setData('title', e.target.value)}
                                    placeholder="Maintenance window tonight"
                                    className="mt-1"
                                />
                                {form.errors.title && <p className="text-xs text-destructive mt-1">{form.errors.title}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <select
                                    value={form.data.type}
                                    onChange={e => form.setData('type', e.target.value)}
                                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="info">ℹ️ Info</option>
                                    <option value="warning">⚠️ Warning</option>
                                    <option value="success">✅ Success</option>
                                    <option value="danger">🚨 Danger</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Body *</label>
                            <textarea
                                value={form.data.body}
                                onChange={e => form.setData('body', e.target.value)}
                                placeholder="We'll be performing maintenance from 2am-4am UTC..."
                                rows={2}
                                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                            {form.errors.body && <p className="text-xs text-destructive mt-1">{form.errors.body}</p>}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium">Link Text</label>
                                <Input
                                    value={form.data.link_text}
                                    onChange={e => form.setData('link_text', e.target.value)}
                                    placeholder="Learn more"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Link URL</label>
                                <Input
                                    value={form.data.link_url}
                                    onChange={e => form.setData('link_url', e.target.value)}
                                    placeholder="https://status.example.com"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium">Starts At (optional)</label>
                                <Input
                                    type="datetime-local"
                                    value={form.data.starts_at}
                                    onChange={e => form.setData('starts_at', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Ends At (optional)</label>
                                <Input
                                    type="datetime-local"
                                    value={form.data.ends_at}
                                    onChange={e => form.setData('ends_at', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={e => form.setData('is_active', e.target.checked)}
                                    className="rounded"
                                />
                                Active immediately
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_dismissible}
                                    onChange={e => form.setData('is_dismissible', e.target.checked)}
                                    className="rounded"
                                />
                                Dismissible
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Creating...' : 'Create Announcement'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}

                {/* Announcements List */}
                <div className="space-y-3">
                    {announcements.data.length === 0 ? (
                        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                            No announcements yet. Create one to display a banner to all users.
                        </div>
                    ) : (
                        announcements.data.map(a => {
                            const Icon = TYPE_ICONS[a.type] || Info;
                            return (
                                <div
                                    key={a.id}
                                    className={`flex items-center gap-4 rounded-xl border bg-card p-4 transition-opacity ${!a.is_active ? 'opacity-50' : ''}`}
                                >
                                    <Icon className={`h-5 w-5 shrink-0 ${TYPE_COLORS[a.type] || ''}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{a.title}</span>
                                            <Badge variant={a.is_active ? 'default' : 'outline'} className="text-[10px]">
                                                {a.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{a.body}</p>
                                        {(a.starts_at || a.ends_at) && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {a.starts_at && `From ${new Date(a.starts_at).toLocaleDateString()}`}
                                                {a.starts_at && a.ends_at && ' — '}
                                                {a.ends_at && `Until ${new Date(a.ends_at).toLocaleDateString()}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleAnnouncement(a.id)}
                                            title={a.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {a.is_active ? (
                                                <ToggleRight className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteAnnouncement(a)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {announcements.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {announcements.links.map((link, i) => (
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
