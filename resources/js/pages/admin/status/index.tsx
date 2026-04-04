import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Edit2,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface StatusIncident {
    id: number;
    title: string;
    message: string;
    status: string;
    resolved_at: string | null;
    created_at: string;
}

interface StatusPageAdminProps {
    incidents: StatusIncident[];
    statuses: string[];
}

const STATUS_CONFIG: Record<
    string,
    { label: string; color: string; icon: typeof CheckCircle2 }
> = {
    operational: {
        label: 'Operational',
        color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        icon: CheckCircle2,
    },
    degraded: {
        label: 'Degraded',
        color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        icon: AlertTriangle,
    },
    outage: {
        label: 'Outage',
        color: 'bg-red-500/10 text-red-700 dark:text-red-400',
        icon: AlertTriangle,
    },
    maintenance: {
        label: 'Maintenance',
        color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        icon: Clock,
    },
};

function IncidentForm({
    incident,
    statuses,
    onCancel,
}: {
    incident?: StatusIncident;
    statuses: string[];
    onCancel: () => void;
}) {
    const form = useForm({
        title: incident?.title ?? '',
        message: incident?.message ?? '',
        status: incident?.status ?? 'degraded',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (incident) {
            form.put(`/admin/status/${incident.id}`, {
                onSuccess: onCancel,
                preserveScroll: true,
            });
        } else {
            form.post('/admin/status', {
                onSuccess: onCancel,
                preserveScroll: true,
            });
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-md border p-5"
        >
            <h3 className="font-semibold">
                {incident ? 'Edit Incident' : 'Create Incident'}
            </h3>

            <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={form.data.title}
                    onChange={(e) => form.setData('title', e.target.value)}
                    placeholder="e.g. API response times elevated"
                />
                {form.errors.title && (
                    <p className="text-xs text-destructive">
                        {form.errors.title}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <textarea
                    id="message"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    value={form.data.message}
                    onChange={(e) => form.setData('message', e.target.value)}
                    placeholder="Describe the incident and current mitigation efforts."
                />
                {form.errors.message && (
                    <p className="text-xs text-destructive">
                        {form.errors.message}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    value={form.data.status}
                    onChange={(e) => form.setData('status', e.target.value)}
                >
                    {statuses.map((s) => (
                        <option key={s} value={s}>
                            {STATUS_CONFIG[s]?.label ?? s}
                        </option>
                    ))}
                </select>
                {form.errors.status && (
                    <p className="text-xs text-destructive">
                        {form.errors.status}
                    </p>
                )}
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={form.processing}>
                    {form.processing
                        ? 'Saving…'
                        : incident
                          ? 'Save Changes'
                          : 'Create Incident'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export default function AdminStatusPage({
    incidents,
    statuses,
}: StatusPageAdminProps) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (confirm('Delete this incident?')) {
            router.delete(`/admin/status/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Status Page" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-md border border-sidebar-border/70 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Activity className="h-6 w-6" />
                            Status Page
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage system incidents displayed on the public
                            status page.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setShowCreateForm(true);
                            setEditingId(null);
                        }}
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        New Incident
                    </Button>
                </div>

                {showCreateForm && (
                    <IncidentForm
                        statuses={statuses}
                        onCancel={() => setShowCreateForm(false)}
                    />
                )}

                {incidents.length === 0 && !showCreateForm ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-500/60" />
                        <p className="font-medium">No incidents</p>
                        <p className="text-sm">
                            Create an incident to update the public status page.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {incidents.map((incident) => {
                            const cfg =
                                STATUS_CONFIG[incident.status] ??
                                STATUS_CONFIG.operational;
                            const StatusIcon = cfg.icon;

                            if (editingId === incident.id) {
                                return (
                                    <IncidentForm
                                        key={incident.id}
                                        incident={incident}
                                        statuses={statuses}
                                        onCancel={() => setEditingId(null)}
                                    />
                                );
                            }

                            return (
                                <div
                                    key={incident.id}
                                    className="flex items-start justify-between gap-4 rounded-md border p-4"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
                                            >
                                                <StatusIcon className="h-3 w-3" />
                                                {cfg.label}
                                            </span>
                                            {incident.resolved_at && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs text-emerald-600 dark:text-emerald-400"
                                                >
                                                    Resolved
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="font-medium">
                                            {incident.title}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                                            {incident.message}
                                        </p>
                                        <p className="mt-1.5 text-xs text-muted-foreground">
                                            {new Date(
                                                incident.created_at,
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setEditingId(incident.id)
                                            }
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(incident.id)
                                            }
                                        >
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="pt-2">
                    <a
                        href="/status"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                        View public status page →
                    </a>
                </div>
            </div>
        </AdminLayout>
    );
}
