import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertTriangle,
    Building2,
    CheckCircle,
    MoreHorizontal,
    Search,
    Users,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

interface Owner {
    id: number;
    name: string;
    email: string;
}

interface PaginatedWorkspace {
    id: number;
    name: string;
    slug: string;
    personal_workspace: boolean;
    plan: string;
    users_count: number;
    owner: Owner | null;
    created_at: string;
    deleted_at: string | null;
    suspended_at: string | null;
    suspension_reason: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AdminWorkspacesProps {
    workspaces: {
        data: PaginatedWorkspace[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string;
        plan: string;
    };
    planOptions: string[];
}

const PLAN_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
    Free: 'outline',
    Pro: 'secondary',
    Business: 'default',
};

export default function AdminWorkspaces({ workspaces, filters, planOptions }: AdminWorkspacesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [plan, setPlan] = useState(filters.plan || '');
    const [suspensionDialogWorkspace, setSuspensionDialogWorkspace] = useState<PaginatedWorkspace | null>(null);
    const [suspensionReason, setSuspensionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/workspaces', { search, plan }, { preserveState: true, replace: true });
    };

    const handlePlanFilter = (value: string) => {
        setPlan(value);
        router.get('/admin/workspaces', { search, plan: value }, { preserveState: true, replace: true });
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const handleSuspend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!suspensionDialogWorkspace) return;

        setProcessing(true);
        router.post(`/admin/workspaces/${suspensionDialogWorkspace.id}/suspend`, {
            reason: suspensionReason,
        }, {
            onFinish: () => {
                setProcessing(false);
                setSuspensionDialogWorkspace(null);
                setSuspensionReason('');
            },
        });
    };

    const handleUnsuspend = (workspace: PaginatedWorkspace) => {
        router.post(`/admin/workspaces/${workspace.id}/unsuspend`);
    };


    return (
        <AdminLayout>
            <Head title="Workspace Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 rounded-xl border border-sidebar-border/70">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Building2 className="h-6 w-6" />
                            Workspace Management
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {workspaces.total} workspace{workspaces.total !== 1 && 's'} on the platform
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search workspaces..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-56 pl-9"
                                />
                            </div>
                            <Button type="submit" size="sm">Search</Button>
                        </form>
                        <select
                            value={plan}
                            onChange={e => handlePlanFilter(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="">All Plans</option>
                            {planOptions.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-medium">Workspace</th>
                                <th className="px-6 py-3 font-medium">Owner</th>
                                <th className="px-6 py-3 font-medium">Plan</th>
                                <th className="px-6 py-3 font-medium">Members</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Created</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {workspaces.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No workspaces found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                workspaces.data.map(ws => (
                                    <tr key={ws.id} className={`transition-colors ${ws.deleted_at ? 'opacity-50 bg-destructive/5' : 'hover:bg-muted/50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">{getInitials(ws.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <span className="font-medium">{ws.name}</span>
                                                    <p className="text-xs text-muted-foreground">/{ws.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {ws.owner ? (
                                                <div>
                                                    <span className="text-foreground text-xs font-medium">{ws.owner.name}</span>
                                                    <p className="text-xs">{ws.owner.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs italic">No owner</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={PLAN_BADGE_VARIANT[ws.plan] || 'outline'}>{ws.plan}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{ws.users_count}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {ws.deleted_at ? (
                                                <Badge variant="destructive">Deleted</Badge>
                                            ) : ws.suspended_at ? (
                                                <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700">Suspended</Badge>
                                            ) : ws.personal_workspace ? (
                                                <Badge variant="outline">Personal</Badge>
                                            ) : (
                                                <Badge variant="secondary">Team</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs">
                                            {new Date(ws.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {ws.suspended_at ? (
                                                        <DropdownMenuItem onClick={() => handleUnsuspend(ws)}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Unsuspend Workspace
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => setSuspensionDialogWorkspace(ws)}
                                                            className="text-destructive focus:text-destructive"
                                                            disabled={!!ws.deleted_at}
                                                        >
                                                            <AlertTriangle className="mr-2 h-4 w-4" />
                                                            Suspend Workspace
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {workspaces.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {workspaces.links.map((link, i) => (
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

            <Dialog open={!!suspensionDialogWorkspace} onOpenChange={() => setSuspensionDialogWorkspace(null)}>
                <DialogContent>
                    <form onSubmit={handleSuspend}>
                        <DialogHeader>
                            <DialogTitle>Suspend Workspace</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to suspend <strong>{suspensionDialogWorkspace?.name}</strong>?
                                Members will be redirected to a suspension page and unable to access workspace data.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <label htmlFor="reason" className="mb-2 block text-sm font-medium">
                                Reason for suspension (optional)
                            </label>
                            <Input
                                id="reason"
                                value={suspensionReason}
                                onChange={e => setSuspensionReason(e.target.value)}
                                placeholder="e.g. Terms of Service violation"
                                maxLength={255}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSuspensionDialogWorkspace(null)}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={processing}>
                                {processing ? 'Suspending...' : 'Suspend Workspace'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
