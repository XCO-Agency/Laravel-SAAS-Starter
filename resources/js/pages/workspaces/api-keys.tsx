import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type BreadcrumbItem } from '@/types';
import {
    AlertTriangle,
    Copy,
    Key,
    Plus,
    Shield,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface ApiKey {
    id: number;
    name: string;
    key_prefix: string;
    scopes: string[];
    last_used_at: string | null;
    expires_at: string | null;
    is_expired: boolean;
    created_by: string;
    created_at: string;
}

interface Props {
    keys: ApiKey[];
    availableScopes: string[];
    isAdmin: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Workspaces', href: '/workspaces' },
    { title: 'API Keys', href: '/workspaces/api-keys' },
];

export default function WorkspaceApiKeys({ keys, availableScopes, isAdmin }: Props) {
    const { props } = usePage();
    const flash = props.flash as { newKey?: string; success?: string } | undefined;

    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
    const [copied, setCopied] = useState(false);

    const form = useForm({
        name: '',
        scopes: [] as string[],
        expires_at: '',
    });

    const deleteForm = useForm();

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/workspaces/api-keys', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setShowForm(false);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteForm.delete(`/workspaces/api-keys/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const toggleScope = (scope: string) => {
        const current = form.data.scopes;
        if (current.includes(scope)) {
            form.setData('scopes', current.filter(s => s !== scope));
        } else {
            form.setData('scopes', [...current, scope]);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workspace API Keys" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Key className="h-6 w-6" />
                            Workspace API Keys
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Manage API keys scoped to this workspace. These are separate from personal access tokens.
                        </p>
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setShowForm(!showForm)} size="sm">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Create Key
                        </Button>
                    )}
                </div>

                {/* Flash: newly created key */}
                {flash?.newKey && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/30">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                    API Key Created
                                </p>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                                    Copy this key now. It will not be shown again.
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <code className="flex-1 rounded bg-white px-3 py-2 font-mono text-xs text-emerald-900 dark:bg-gray-800 dark:text-emerald-100 break-all">
                                        {flash.newKey}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(flash.newKey!)}
                                    >
                                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Form */}
                {showForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Create API Key</CardTitle>
                            <CardDescription>
                                API keys authenticate workspace-level API requests.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Name *</label>
                                    <Input
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        placeholder="Production API key"
                                        className="mt-1"
                                    />
                                    {form.errors.name && <p className="text-xs text-destructive mt-1">{form.errors.name}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Scopes</label>
                                    <p className="text-xs text-muted-foreground mb-2">Select the permissions for this key.</p>
                                    <div className="flex flex-wrap gap-2">
                                        {availableScopes.map(scope => (
                                            <button
                                                key={scope}
                                                type="button"
                                                onClick={() => toggleScope(scope)}
                                                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                                                    form.data.scopes.includes(scope)
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                                                }`}
                                            >
                                                {scope}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Expires At (optional)</label>
                                    <Input
                                        type="datetime-local"
                                        value={form.data.expires_at}
                                        onChange={e => form.setData('expires_at', e.target.value)}
                                        className="mt-1 max-w-xs"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? 'Creating...' : 'Create Key'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Keys List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Keys</CardTitle>
                        <CardDescription>
                            {keys.length === 0
                                ? 'No API keys yet. Create one to enable workspace-level API access.'
                                : `${keys.length} key${keys.length > 1 ? 's' : ''} configured.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {keys.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Key className="h-10 w-10 mb-3 opacity-30" />
                                <p className="text-sm">No workspace API keys.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {keys.map(key => (
                                    <div
                                        key={key.id}
                                        className={`flex items-center justify-between rounded-lg border p-4 ${key.is_expired ? 'opacity-50' : ''}`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium">{key.name}</span>
                                                <Badge variant="outline" className="font-mono text-[10px]">
                                                    {key.key_prefix}...
                                                </Badge>
                                                {key.is_expired && (
                                                    <Badge variant="destructive" className="text-[10px]">
                                                        <AlertTriangle className="mr-1 h-3 w-3" />
                                                        Expired
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                                <span>Created by {key.created_by}</span>
                                                <span>
                                                    {key.last_used_at
                                                        ? `Last used ${new Date(key.last_used_at).toLocaleDateString()}`
                                                        : 'Never used'}
                                                </span>
                                                {key.expires_at && (
                                                    <span>
                                                        Expires {new Date(key.expires_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            {key.scopes.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {key.scopes.map(scope => (
                                                        <Badge key={scope} variant="secondary" className="text-[10px]">
                                                            {scope}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {isAdmin && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive shrink-0 ml-4"
                                                onClick={() => setDeleteTarget(key)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1.5" />
                                                Revoke
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revoke API Key</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to revoke &quot;{deleteTarget?.name}&quot;? Any integrations using this key will immediately lose access.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteForm.processing}>
                            Revoke Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
