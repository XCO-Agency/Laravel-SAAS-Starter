import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Edit2,
    Globe,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface SeoEntry {
    id: number;
    path: string | null;
    title: string | null;
    description: string | null;
    keywords: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    og_type: string;
    twitter_card: string;
    twitter_site: string | null;
    twitter_creator: string | null;
    twitter_image: string | null;
    is_global: boolean;
}

interface Props {
    entries: SeoEntry[];
}

function SeoForm({ entry, onCancel }: { entry?: SeoEntry; onCancel: () => void }) {
    const form = useForm({
        path: entry?.path ?? '',
        title: entry?.title ?? '',
        description: entry?.description ?? '',
        keywords: entry?.keywords ?? '',
        og_title: entry?.og_title ?? '',
        og_description: entry?.og_description ?? '',
        og_image: entry?.og_image ?? '',
        og_type: entry?.og_type ?? 'website',
        twitter_card: entry?.twitter_card ?? 'summary_large_image',
        twitter_site: entry?.twitter_site ?? '',
        twitter_creator: entry?.twitter_creator ?? '',
        twitter_image: entry?.twitter_image ?? '',
        is_global: entry?.is_global ?? false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (entry) {
            form.put(`/admin/seo/${entry.id}`, { onSuccess: onCancel, preserveScroll: true });
        } else {
            form.post('/admin/seo', { onSuccess: () => { form.reset(); onCancel(); }, preserveScroll: true });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.data.is_global}
                        onChange={e => form.setData('is_global', e.target.checked)}
                        className="rounded"
                    />
                    Global fallback (applies to all pages without specific SEO)
                </label>
            </div>

            {!form.data.is_global && (
                <div>
                    <label className="text-sm font-medium">Path</label>
                    <Input
                        value={form.data.path}
                        onChange={e => form.setData('path', e.target.value)}
                        placeholder="/about"
                        className="mt-1"
                    />
                    {form.errors.path && <p className="text-xs text-destructive mt-1">{form.errors.path}</p>}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="text-sm font-medium">Meta Title</label>
                    <Input
                        value={form.data.title}
                        onChange={e => form.setData('title', e.target.value)}
                        placeholder="Page Title | My App"
                        className="mt-1"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Keywords</label>
                    <Input
                        value={form.data.keywords}
                        onChange={e => form.setData('keywords', e.target.value)}
                        placeholder="saas, billing, teams"
                        className="mt-1"
                    />
                </div>
            </div>

            <div>
                <label className="text-sm font-medium">Meta Description</label>
                <textarea
                    value={form.data.description}
                    onChange={e => form.setData('description', e.target.value)}
                    placeholder="A brief description of this page for search engines..."
                    rows={2}
                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
            </div>

            <details className="border rounded-lg p-3">
                <summary className="text-sm font-medium cursor-pointer">Open Graph Settings</summary>
                <div className="grid gap-4 md:grid-cols-2 mt-3">
                    <div>
                        <label className="text-sm font-medium">OG Title</label>
                        <Input
                            value={form.data.og_title}
                            onChange={e => form.setData('og_title', e.target.value)}
                            placeholder="Leave blank to use meta title"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">OG Type</label>
                        <select
                            value={form.data.og_type}
                            onChange={e => form.setData('og_type', e.target.value)}
                            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="website">website</option>
                            <option value="article">article</option>
                            <option value="product">product</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">OG Description</label>
                        <textarea
                            value={form.data.og_description}
                            onChange={e => form.setData('og_description', e.target.value)}
                            placeholder="Leave blank to use meta description"
                            rows={2}
                            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">OG Image URL</label>
                        <Input
                            value={form.data.og_image}
                            onChange={e => form.setData('og_image', e.target.value)}
                            placeholder="https://example.com/og-image.png"
                            className="mt-1"
                        />
                    </div>
                </div>
            </details>

            <details className="border rounded-lg p-3">
                <summary className="text-sm font-medium cursor-pointer">Twitter Card Settings</summary>
                <div className="grid gap-4 md:grid-cols-2 mt-3">
                    <div>
                        <label className="text-sm font-medium">Card Type</label>
                        <select
                            value={form.data.twitter_card}
                            onChange={e => form.setData('twitter_card', e.target.value)}
                            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="summary">summary</option>
                            <option value="summary_large_image">summary_large_image</option>
                            <option value="app">app</option>
                            <option value="player">player</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Twitter @site</label>
                        <Input
                            value={form.data.twitter_site}
                            onChange={e => form.setData('twitter_site', e.target.value)}
                            placeholder="@myapp"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Twitter @creator</label>
                        <Input
                            value={form.data.twitter_creator}
                            onChange={e => form.setData('twitter_creator', e.target.value)}
                            placeholder="@author"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Twitter Image URL</label>
                        <Input
                            value={form.data.twitter_image}
                            onChange={e => form.setData('twitter_image', e.target.value)}
                            placeholder="https://example.com/twitter-card.png"
                            className="mt-1"
                        />
                    </div>
                </div>
            </details>

            <div className="flex gap-2">
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? 'Saving...' : entry ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export default function SeoMetadata({ entries }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const deleteEntry = (entry: SeoEntry) => {
        if (confirm(`Delete SEO entry for "${entry.is_global ? 'Global' : entry.path}"?`)) {
            router.delete(`/admin/seo/${entry.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="SEO Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Globe className="h-6 w-6" />
                            SEO Management
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage meta tags for specific pages or set global fallback defaults.
                        </p>
                    </div>
                    <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} size="sm">
                        <Plus className="mr-1.5 h-4 w-4" />
                        New Entry
                    </Button>
                </div>

                {showForm && !editingId && (
                    <SeoForm onCancel={() => setShowForm(false)} />
                )}

                <div className="space-y-3">
                    {entries.length === 0 ? (
                        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                            No SEO metadata entries yet. Create a global entry for site-wide defaults, or add per-page entries.
                        </div>
                    ) : (
                        entries.map(entry => {
                            if (editingId === entry.id) {
                                return (
                                    <SeoForm
                                        key={entry.id}
                                        entry={entry}
                                        onCancel={() => setEditingId(null)}
                                    />
                                );
                            }

                            return (
                                <div
                                    key={entry.id}
                                    className="flex items-start gap-4 rounded-xl border bg-card p-4"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Globe className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {entry.is_global ? (
                                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                    Global Default
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {entry.path}
                                                </Badge>
                                            )}
                                            {entry.title && (
                                                <span className="font-medium truncate">{entry.title}</span>
                                            )}
                                        </div>
                                        {entry.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {entry.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {entry.og_type && (
                                                <span className="text-xs text-muted-foreground">
                                                    og:{entry.og_type}
                                                </span>
                                            )}
                                            {entry.twitter_card && (
                                                <span className="text-xs text-muted-foreground">
                                                    twitter:{entry.twitter_card}
                                                </span>
                                            )}
                                            {entry.keywords && (
                                                <span className="text-xs text-muted-foreground truncate max-w-xs">
                                                    {entry.keywords}
                                                </span>
                                            )}
                                        </div>
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
