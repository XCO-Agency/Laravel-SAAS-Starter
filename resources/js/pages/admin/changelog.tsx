import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Edit2,
    ListChecks,
    Plus,
    Sparkles,
    Trash2,
    Wrench,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface ChangelogEntry {
    id: number;
    version: string;
    title: string;
    body: string;
    type: string;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
}

interface Props {
    entries: ChangelogEntry[];
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Sparkles; color: string }> = {
    feature: { label: 'Feature', icon: Sparkles, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    improvement: { label: 'Improvement', icon: Zap, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    fix: { label: 'Fix', icon: Wrench, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
};

function EntryForm({ entry, onCancel }: { entry?: ChangelogEntry; onCancel: () => void }) {
    const form = useForm({
        version: entry?.version ?? '',
        title: entry?.title ?? '',
        body: entry?.body ?? '',
        type: entry?.type ?? 'improvement',
        is_published: entry?.is_published ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (entry) {
            form.put(`/admin/changelog/${entry.id}`, { onSuccess: onCancel, preserveScroll: true });
        } else {
            form.post('/admin/changelog', { onSuccess: () => { form.reset(); onCancel(); }, preserveScroll: true });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <div>
                    <label className="text-sm font-medium">Version *</label>
                    <Input
                        value={form.data.version}
                        onChange={e => form.setData('version', e.target.value)}
                        placeholder="1.2.0"
                        className="mt-1"
                    />
                    {form.errors.version && <p className="text-xs text-destructive mt-1">{form.errors.version}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                        value={form.data.title}
                        onChange={e => form.setData('title', e.target.value)}
                        placeholder="Dark mode support"
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
                        <option value="feature">Feature</option>
                        <option value="improvement">Improvement</option>
                        <option value="fix">Fix</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="text-sm font-medium">Body (Markdown) *</label>
                <textarea
                    value={form.data.body}
                    onChange={e => form.setData('body', e.target.value)}
                    placeholder="Describe the changes in this release..."
                    rows={4}
                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
                {form.errors.body && <p className="text-xs text-destructive mt-1">{form.errors.body}</p>}
            </div>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.data.is_published}
                        onChange={e => form.setData('is_published', e.target.checked)}
                        className="rounded"
                    />
                    Publish immediately
                </label>
            </div>
            <div className="flex gap-2">
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? 'Saving...' : entry ? 'Update Entry' : 'Create Entry'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export default function AdminChangelog({ entries }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const deleteEntry = (entry: ChangelogEntry) => {
        if (confirm(`Delete "${entry.title}"?`)) {
            router.delete(`/admin/changelog/${entry.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Changelog Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <ListChecks className="h-6 w-6" />
                            Changelog
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage public release notes visible at /changelog
                        </p>
                    </div>
                    <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} size="sm">
                        <Plus className="mr-1.5 h-4 w-4" />
                        New Entry
                    </Button>
                </div>

                {showForm && !editingId && (
                    <EntryForm onCancel={() => setShowForm(false)} />
                )}

                <div className="space-y-3">
                    {entries.length === 0 ? (
                        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                            No changelog entries yet. Create one to share updates with your users.
                        </div>
                    ) : (
                        entries.map(entry => {
                            if (editingId === entry.id) {
                                return (
                                    <EntryForm
                                        key={entry.id}
                                        entry={entry}
                                        onCancel={() => setEditingId(null)}
                                    />
                                );
                            }

                            const config = TYPE_CONFIG[entry.type] || TYPE_CONFIG.improvement;
                            const Icon = config.icon;

                            return (
                                <div
                                    key={entry.id}
                                    className={`flex items-start gap-4 rounded-xl border bg-card p-4 transition-opacity ${!entry.is_published ? 'opacity-50' : ''}`}
                                >
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="font-mono text-xs">
                                                v{entry.version}
                                            </Badge>
                                            <span className="font-medium">{entry.title}</span>
                                            <Badge variant={entry.is_published ? 'default' : 'secondary'} className="text-[10px]">
                                                {entry.is_published ? 'Published' : 'Draft'}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px]">
                                                {config.label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {entry.body}
                                        </p>
                                        {entry.published_at && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Published {new Date(entry.published_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => { setEditingId(entry.id); setShowForm(false); }}
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteEntry(entry)}
                                            className="text-destructive"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
