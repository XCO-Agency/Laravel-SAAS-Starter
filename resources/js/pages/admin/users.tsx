import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    CheckCircle,
    Download,
    MoreHorizontal,
    RotateCcw,
    Search,
    Shield,
    ShieldOff,
    Trash2,
    UserCog,
    Users,
    XCircle,
    MonitorSmartphone,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

interface PaginatedUser {
    id: number;
    name: string;
    email: string;
    is_superadmin: boolean;
    created_at: string;
    deleted_at: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AdminUsersProps {
    users: {
        data: PaginatedUser[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string;
    };
}

export default function AdminUsers({ users, filters }: AdminUsersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search }, { preserveState: true, replace: true });
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const toggleSuperadmin = (user: PaginatedUser) => {
        if (confirm(`Are you sure you want to ${user.is_superadmin ? 'demote' : 'promote'} ${user.name}?`)) {
            router.put(`/admin/users/${user.id}`, { is_superadmin: !user.is_superadmin }, { preserveScroll: true });
        }
    };

    const deleteUser = (user: PaginatedUser) => {
        if (confirm(`Are you sure you want to delete ${user.name}? The user can be restored later.`)) {
            router.delete(`/admin/users/${user.id}`, { preserveScroll: true });
        }
    };

    const restoreUser = (user: PaginatedUser) => {
        if (confirm(`Restore ${user.name}?`)) {
            router.post(`/admin/users/${user.id}/restore`, {}, { preserveScroll: true });
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === users.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(users.data.map(u => u.id));
        }
    };

    const bulkVerifyEmail = () => {
        if (confirm(`Verify email for ${selectedIds.length} selected user(s)?`)) {
            router.post('/admin/users/bulk-verify-email', { user_ids: selectedIds }, {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    const bulkSuspend = () => {
        if (confirm(`Suspend ${selectedIds.length} selected user(s)? They can be restored later.`)) {
            router.post('/admin/users/bulk-suspend', { user_ids: selectedIds }, {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    const bulkExport = () => {
        // Use a form submission for file download
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/admin/users/bulk-export';

        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfMeta?.getAttribute('content') ?? '';
        form.appendChild(csrfInput);

        selectedIds.forEach(id => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'user_ids[]';
            input.value = String(id);
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    return (
        <AdminLayout>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 rounded-xl border border-sidebar-border/70">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Users className="h-6 w-6" />
                            User Management
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {users.total} user{users.total !== 1 && 's'} on the platform
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-64 pl-9"
                            />
                        </div>
                        <Button type="submit" size="sm">Search</Button>
                    </form>
                </div>

                {/* Bulk Actions Toolbar */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
                        <span className="text-sm font-medium">
                            {selectedIds.length} selected
                        </span>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={bulkVerifyEmail}>
                                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                Verify Email
                            </Button>
                            <Button size="sm" variant="outline" onClick={bulkExport}>
                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                Export CSV
                            </Button>
                            <Button size="sm" variant="destructive" onClick={bulkSuspend}>
                                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                Suspend
                            </Button>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedIds([])}
                            className="ml-auto text-xs"
                        >
                            Clear
                        </Button>
                    </div>
                )}

                <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="w-12 px-4 py-3">
                                    <Checkbox
                                        checked={users.data.length > 0 && selectedIds.length === users.data.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 font-medium">User</th>
                                <th className="px-6 py-3 font-medium">Email</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Joined</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                users.data.map(user => (
                                    <tr key={user.id} className={`transition-colors ${user.deleted_at ? 'opacity-50 bg-destructive/5' : selectedIds.includes(user.id) ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                                        <td className="px-4 py-4">
                                            <Checkbox
                                                checked={selectedIds.includes(user.id)}
                                                onCheckedChange={() => toggleSelect(user.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {user.deleted_at ? (
                                                    <Badge variant="destructive">Deleted</Badge>
                                                ) : user.is_superadmin ? (
                                                    <Badge variant="default">
                                                        <Shield className="mr-1 h-3 w-3" />
                                                        Superadmin
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">User</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.deleted_at ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => restoreUser(user)}
                                                >
                                                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                                    Restore
                                                </Button>
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => toggleSuperadmin(user)}>
                                                            {user.is_superadmin ? (
                                                                <>
                                                                    <ShieldOff className="mr-2 h-4 w-4" />
                                                                    Demote from Superadmin
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Shield className="mr-2 h-4 w-4" />
                                                                    Promote to Superadmin
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => router.post(`/admin/impersonate/${user.id}`)}
                                                        >
                                                            <UserCog className="mr-2 h-4 w-4" />
                                                            Impersonate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => router.get(`/admin/users/${user.id}/sessions`)}
                                                        >
                                                            <MonitorSmartphone className="mr-2 h-4 w-4" />
                                                            Manage Sessions
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => deleteUser(user)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {users.links.map((link, i) => (
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
