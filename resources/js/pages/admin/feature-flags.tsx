import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Plus, ToggleLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface WorkspaceInfo {
    id: number;
    name: string;
    slug: string;
}

interface FeatureFlagItem {
    id: number;
    key: string;
    name: string;
    description: string | null;
    is_global: boolean;
    workspace_ids: number[];
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    flags: {
        data: FeatureFlagItem[];
        links: PaginationLink[];
        total: number;
        last_page: number;
    };
    workspaces: WorkspaceInfo[];
}

export default function AdminFeatureFlags({ flags, workspaces }: Props) {
    const [editingFlag, setEditingFlag] = useState<FeatureFlagItem | null>(null);
    const [showForm, setShowForm] = useState(false);

    const form = useForm({
        key: '',
        name: '',
        description: '',
        is_global: false,
        workspace_ids: [] as number[],
    });

    const openCreateForm = () => {
        setEditingFlag(null);
        form.reset();
        form.clearErrors();
        setShowForm(true);
    };

    const openEditForm = (flag: FeatureFlagItem) => {
        setEditingFlag(flag);
        form.setData({
            key: flag.key,
            name: flag.name,
            description: flag.description || '',
            is_global: flag.is_global,
            workspace_ids: flag.workspace_ids || [],
        });
        form.clearErrors();
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingFlag(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingFlag) {
            form.put(`/admin/feature-flags/${editingFlag.id}`, {
                onSuccess: () => closeForm(),
                preserveScroll: true,
            });
        } else {
            form.post('/admin/feature-flags', {
                onSuccess: () => closeForm(),
                preserveScroll: true,
            });
        }
    };

    const deleteFlag = (flag: FeatureFlagItem) => {
        if (confirm(`Delete feature flag "${flag.name}"?`)) {
            router.delete(`/admin/feature-flags/${flag.id}`, { preserveScroll: true });
        }
    };

    const toggleWorkspace = (id: number) => {
        const current = form.data.workspace_ids;
        if (current.includes(id)) {
            form.setData('workspace_ids', current.filter(wId => wId !== id));
        } else {
            form.setData('workspace_ids', [...current, id]);
        }
    };

    return (
        <AdminLayout>
            <Head title="Feature Flags" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 rounded-xl border border-sidebar-border/70">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <ToggleLeft className="h-6 w-6 text-primary" />
                            Feature Flags
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage feature rollouts locally across all workspaces
                        </p>
                    </div>
                    <Button onClick={openCreateForm} size="sm">
                        <Plus className="mr-1.5 h-4 w-4" />
                        New Flag
                    </Button>
                </div>

                {/* Form Modal (Inline for now, could be dialog) */}
                {showForm && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium">{editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium">Flag Key (slug format) *</label>
                                    <Input
                                        value={form.data.key}
                                        onChange={e => form.setData('key', e.target.value)}
                                        placeholder="e.g. new-dashboard"
                                        className="mt-1"
                                    />
                                    {form.errors.key && <p className="text-xs text-destructive mt-1">{form.errors.key}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Display Name *</label>
                                    <Input
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        placeholder="e.g. New Dashboard UI"
                                        className="mt-1"
                                    />
                                    {form.errors.name && <p className="text-xs text-destructive mt-1">{form.errors.name}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={form.data.description}
                                    onChange={e => form.setData('description', e.target.value)}
                                    rows={2}
                                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Brief explanation of what this flag controls..."
                                />
                                {form.errors.description && <p className="text-xs text-destructive mt-1">{form.errors.description}</p>}
                            </div>

                            <div className="rounded-lg border p-4 bg-muted/30">
                                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_global}
                                        onChange={e => form.setData('is_global', e.target.checked)}
                                        className="rounded border-input text-primary"
                                    />
                                    Global Rollout (Enabled for ALL Workspaces)
                                </label>

                                {!form.data.is_global && (
                                    <div className="mt-4 pt-4 border-t">
                                        <label className="text-sm font-medium mb-2 block">Enabled Workspaces (Specific Rollout)</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {workspaces.map(w => (
                                                <label key={w.id} className="flex items-center gap-2 text-sm p-2 rounded border hover:bg-accent cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.data.workspace_ids.includes(w.id)}
                                                        onChange={() => toggleWorkspace(w.id)}
                                                        className="rounded border-input"
                                                    />
                                                    <span className="truncate" title={w.name}>{w.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <Button type="button" variant="outline" onClick={closeForm}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? 'Saving...' : (editingFlag ? 'Save Changes' : 'Create Flag')}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Flags List */}
                <div className="space-y-3">
                    {flags.data.length === 0 && !showForm ? (
                        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                            No feature flags configured.
                        </div>
                    ) : (
                        flags.data.map(flag => (
                            <div key={flag.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold">{flag.name}</span>
                                        <Badge variant="outline" className="font-mono text-[10px] bg-muted">
                                            {flag.key}
                                        </Badge>
                                        <Badge variant={flag.is_global ? 'default' : 'secondary'} className="text-[10px]">
                                            {flag.is_global ? 'Global' : 'Targeted'}
                                        </Badge>
                                    </div>
                                    {flag.description && (
                                        <p className="text-sm text-muted-foreground mb-2">{flag.description}</p>
                                    )}
                                    {!flag.is_global && (
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-xs text-muted-foreground mr-1">Enabled for:</span>
                                            {flag.workspace_ids.length === 0 ? (
                                                <span className="text-xs text-muted-foreground italic">No workspaces</span>
                                            ) : (
                                                flag.workspace_ids.slice(0, 5).map(id => {
                                                    const w = workspaces.find(ws => ws.id === id);
                                                    return w ? <Badge key={id} variant="outline" className="text-[10px] bg-background">{w.name}</Badge> : null;
                                                })
                                            )}
                                            {flag.workspace_ids.length > 5 && (
                                                <span className="text-xs text-muted-foreground">+{flag.workspace_ids.length - 5} more</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                                    <Button variant="ghost" size="sm" onClick={() => openEditForm(flag)}>
                                        <Edit2 className="h-4 w-4 sm:mr-1.5" />
                                        <span className="sr-only sm:not-sr-only">Edit</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteFlag(flag)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4 sm:mr-1.5" />
                                        <span className="sr-only sm:not-sr-only">Delete</span>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {flags.last_page > 1 && (
                    <div className="flex justify-center pt-2">
                        <div className="flex gap-1">
                            {flags.links.map((link, i) => (
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
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
