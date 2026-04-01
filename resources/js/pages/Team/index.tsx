import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import WorkspaceLayout from '@/layouts/settings/workspace-layout';
import {
    type BreadcrumbItem,
    type TeamMember,
    type Workspace,
    type WorkspaceInvitation,
    type WorkspaceInviteLink,
    type WorkspaceRole,
} from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    AlertTriangle,
    Check,
    Clock,
    Copy,
    Crown,
    Download,
    Link2,
    Mail,
    MoreHorizontal,
    Search,
    Settings,
    Shield,
    Trash2,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const AVAILABLE_PERMISSION_GROUPS = [
    {
        id: 'team',
        label: 'Team Access',
        permissions: [
            {
                id: 'manage_team',
                label: 'Team Management',
                description:
                    'Invite members, edit member roles, and manage invite links.',
            },
        ],
    },
    {
        id: 'billing',
        label: 'Billing Access',
        permissions: [
            {
                id: 'manage_billing',
                label: 'Billing Management',
                description:
                    'Change subscription plans and manage billing portal actions.',
            },
        ],
    },
    {
        id: 'operations',
        label: 'Operations Access',
        permissions: [
            {
                id: 'manage_webhooks',
                label: 'Webhook Management',
                description: 'Create and update workspace webhook endpoints.',
            },
            {
                id: 'view_activity_logs',
                label: 'Activity Log Visibility',
                description:
                    'View workspace activity history and audit events.',
            },
        ],
    },
];

interface PermissionPreset {
    id: number;
    name: string;
    description: string | null;
    permissions: string[];
}

interface TeamIndexProps {
    workspace: Workspace;
    members: TeamMember[];
    pendingInvitations: WorkspaceInvitation[];
    inviteLinks: (WorkspaceInviteLink & { is_usable: boolean })[];
    userRole: WorkspaceRole;
    canInvite: boolean;
    memberLimitMessage: string;
    permissionPresets: PermissionPreset[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Team', href: '/team' }];

export default function TeamIndex({
    workspace,
    members,
    pendingInvitations,
    inviteLinks,
    userRole,
    canInvite,
    memberLimitMessage,
    permissionPresets = [],
}: TeamIndexProps) {
    const [inviteOpen, setInviteOpen] = useState(false);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const { t } = useTranslations();
    const isAdmin = userRole === 'owner' || userRole === 'admin';
    const isOwner = userRole === 'owner';

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkRole, setBulkRole] = useState<WorkspaceRole>('member');
    const selectableMembers = members.filter(
        (m) => m.role !== 'owner' && !m.is_current_user,
    );

    const toggleMember = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === selectableMembers.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(selectableMembers.map((m) => m.id)));
        }
    };

    const clearSelection = () => setSelectedIds(new Set());

    // Search & filter state
    const [memberSearch, setMemberSearch] = useState('');
    const [memberRoleFilter, setMemberRoleFilter] = useState<
        'all' | WorkspaceRole
    >('all');

    const filteredMembers = members.filter((m) => {
        const matchesSearch =
            memberSearch === '' ||
            m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.email.toLowerCase().includes(memberSearch.toLowerCase());
        const matchesRole =
            memberRoleFilter === 'all' || m.role === memberRoleFilter;
        return matchesSearch && matchesRole;
    });

    const executeBulkAction = (action: 'remove' | 'change_role') => {
        if (selectedIds.size === 0) return;
        if (
            action === 'remove' &&
            !confirm(
                `Remove ${selectedIds.size} member${selectedIds.size !== 1 ? 's' : ''} from the workspace?`,
            )
        )
            return;
        router.post(
            '/team/bulk-action',
            {
                action,
                user_ids: Array.from(selectedIds),
                role: action === 'change_role' ? bulkRole : undefined,
            },
            { preserveScroll: true, onSuccess: () => clearSelection() },
        );
    };

    const [editPermissionsOpen, setEditPermissionsOpen] = useState(false);
    const [selectedMemberForPermissions, setSelectedMemberForPermissions] =
        useState<TeamMember | null>(null);

    const {
        data: permissionsData,
        setData: setPermissionsData,
        processing: permissionsProcessing,
    } = useForm({
        permissions: [] as string[],
    });

    useEffect(() => {
        if (selectedMemberForPermissions) {
            setPermissionsData(
                'permissions',
                selectedMemberForPermissions.permissions || [],
            );
        }
    }, [selectedMemberForPermissions, setPermissionsData]);

    const handleUpdatePermissions = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMemberForPermissions) return;

        router.put(
            `/team/members/${selectedMemberForPermissions.id}/permissions`,
            permissionsData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditPermissionsOpen(false);
                    setTimeout(
                        () => setSelectedMemberForPermissions(null),
                        200,
                    );
                },
            },
        );
    };

    const {
        data: inviteData,
        setData: setInviteData,
        errors: inviteErrors,
        processing: inviteProcessing,
        reset: resetInvite,
    } = useForm({
        email: '',
        role: 'member' as WorkspaceRole,
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/team/invite', inviteData, {
            preserveScroll: true,
            onSuccess: () => {
                resetInvite();
                setInviteOpen(false);
            },
        });
    };

    const updateRole = (member: TeamMember, role: WorkspaceRole) => {
        router.put(
            `/team/members/${member.id}/role`,
            { role },
            {
                preserveScroll: true,
            },
        );
    };

    const removeMember = (member: TeamMember) => {
        if (
            confirm(
                `Are you sure you want to remove ${member.name} from this workspace?`,
            )
        ) {
            router.delete(`/team/members/${member.id}`, {
                preserveScroll: true,
            });
        }
    };

    const transferOwnership = (member: TeamMember) => {
        if (
            confirm(
                `Are you sure you want to transfer ownership to ${member.name}? You will become an admin.`,
            )
        ) {
            router.post(
                `/team/transfer-ownership/${member.id}`,
                {},
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const cancelInvitation = (invitation: WorkspaceInvitation) => {
        router.delete(`/team/invitations/${invitation.id}`, {
            preserveScroll: true,
        });
    };

    // Invite link form
    const {
        data: linkData,
        setData: setLinkData,
        processing: linkProcessing,
        reset: resetLink,
    } = useForm({
        role: 'member' as WorkspaceRole,
        max_uses: '' as string | number,
        expires_in_days: '' as string | number,
    });

    const handleCreateLink = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            '/team/invite-links',
            {
                role: linkData.role,
                max_uses: linkData.max_uses || null,
                expires_in_days: linkData.expires_in_days || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    resetLink();
                    setLinkDialogOpen(false);
                },
            },
        );
    };

    const revokeLink = (link: WorkspaceInviteLink) => {
        router.delete(`/team/invite-links/${link.id}`, {
            preserveScroll: true,
        });
    };

    const copyLinkUrl = (
        link: WorkspaceInviteLink & { is_usable: boolean },
    ) => {
        navigator.clipboard.writeText(link.url);
        setCopiedId(link.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadgeVariant = (role: WorkspaceRole) => {
        switch (role) {
            case 'owner':
                return 'default';
            case 'admin':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('team.title', 'Team')} />

            <WorkspaceLayout
                title={t('team.title', 'Team')}
                description={t(
                    'team.description',
                    'Manage team members in {{workspace}}.',
                    { workspace: workspace.name },
                )}
                fullWidth
            >
                <div className="space-y-6">
                    {!canInvite && (
                        <Alert className="border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertTitle className="text-amber-800 dark:text-amber-300">
                                Team member limit reached
                            </AlertTitle>
                            <AlertDescription className="flex items-center justify-between gap-4">
                                <span className="text-amber-700 dark:text-amber-400">
                                    {memberLimitMessage} Upgrade your plan to
                                    invite more members.
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="shrink-0 border-amber-400 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
                                    asChild
                                >
                                    <a href="/workspaces/billing">
                                        Upgrade Plan
                                    </a>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="flex items-center justify-end gap-2">
                        {isAdmin && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    window.location.href =
                                        '/team/export-members';
                                }}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        )}
                        {isAdmin && (
                            <Dialog
                                open={inviteOpen}
                                onOpenChange={setInviteOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button disabled={!canInvite}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {t(
                                            'team.invite_member',
                                            'Invite Member',
                                        )}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleInvite}>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {t(
                                                    'team.invite_new_member',
                                                    'Invite New Member',
                                                )}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {t(
                                                    'team.invite_description',
                                                    'Enter the email address and role for the new team member.',
                                                )}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    {t(
                                                        'team.email_address',
                                                        'Email Address',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder={t(
                                                        'team.member_email_placeholder',
                                                        'colleague@example.com',
                                                    )}
                                                    value={inviteData.email}
                                                    onChange={(e) =>
                                                        setInviteData(
                                                            'email',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={inviteErrors.email}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="role">
                                                    {t('team.role', 'Role')}
                                                </Label>
                                                <Select
                                                    value={inviteData.role}
                                                    onValueChange={(
                                                        value: string,
                                                    ) =>
                                                        setInviteData(
                                                            'role',
                                                            value as WorkspaceRole,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={t(
                                                                'team.role',
                                                                'Role',
                                                            )}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="member">
                                                            {t(
                                                                'team.member',
                                                                'Member',
                                                            )}
                                                        </SelectItem>
                                                        <SelectItem value="admin">
                                                            {t(
                                                                'team.admin',
                                                                'Admin',
                                                            )}
                                                        </SelectItem>
                                                        <SelectItem value="viewer">
                                                            {t(
                                                                'team.viewer',
                                                                'Viewer',
                                                            )}
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    {t(
                                                        'team.role_description',
                                                        'Admins can manage team members and workspace settings.',
                                                    )}
                                                </p>
                                                <InputError
                                                    message={inviteErrors.role}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setInviteOpen(false)
                                                }
                                            >
                                                {t('common.cancel', 'Cancel')}
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={inviteProcessing}
                                            >
                                                {inviteProcessing && (
                                                    <Spinner className="mr-2" />
                                                )}
                                                {t(
                                                    'team.send_invitation',
                                                    'Send Invitation',
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {memberLimitMessage}
                    </p>

                    {/* Team Members */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isAdmin &&
                                        selectableMembers.length > 0 && (
                                            <Checkbox
                                                checked={
                                                    selectedIds.size ===
                                                        selectableMembers.length &&
                                                    selectableMembers.length > 0
                                                }
                                                onCheckedChange={
                                                    toggleSelectAll
                                                }
                                                aria-label="Select all members"
                                            />
                                        )}
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            {t(
                                                'team.team_members',
                                                'Team Members',
                                            )}
                                            {(memberSearch ||
                                                memberRoleFilter !== 'all') && (
                                                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-normal text-primary-foreground">
                                                    {filteredMembers.length}
                                                </span>
                                            )}
                                        </CardTitle>
                                        <CardDescription>
                                            {t(
                                                'team.team_members_desc',
                                                'All members currently in your workspace.',
                                            )}
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t(
                                            'team.search_members',
                                            'Search by name or email…',
                                        )}
                                        value={memberSearch}
                                        onChange={(e) =>
                                            setMemberSearch(e.target.value)
                                        }
                                        className="pr-8 pl-8"
                                    />
                                    {memberSearch && (
                                        <button
                                            onClick={() => setMemberSearch('')}
                                            className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <Select
                                    value={memberRoleFilter}
                                    onValueChange={(v) =>
                                        setMemberRoleFilter(
                                            v as 'all' | WorkspaceRole,
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('team.all_roles', 'All Roles')}
                                        </SelectItem>
                                        <SelectItem value="owner">
                                            {t('team.owner', 'Owner')}
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            {t('team.admin', 'Admin')}
                                        </SelectItem>
                                        <SelectItem value="member">
                                            {t('team.member', 'Member')}
                                        </SelectItem>
                                        <SelectItem value="viewer">
                                            {t('team.viewer', 'Viewer')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredMembers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                        <Search className="mb-2 h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                'team.no_members_found',
                                                'No members match your search.',
                                            )}
                                        </p>
                                        <button
                                            onClick={() => {
                                                setMemberSearch('');
                                                setMemberRoleFilter('all');
                                            }}
                                            className="mt-2 text-xs text-primary hover:underline"
                                        >
                                            {t(
                                                'team.clear_filters',
                                                'Clear filters',
                                            )}
                                        </button>
                                    </div>
                                ) : null}
                                {filteredMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${selectedIds.has(member.id) ? 'bg-muted/50' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {isAdmin &&
                                                member.role !== 'owner' &&
                                                !member.is_current_user && (
                                                    <Checkbox
                                                        checked={selectedIds.has(
                                                            member.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleMember(
                                                                member.id,
                                                            )
                                                        }
                                                        aria-label={`Select ${member.name}`}
                                                    />
                                                )}
                                            <Avatar>
                                                <AvatarFallback>
                                                    {getInitials(member.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">
                                                        {member.name}
                                                    </p>
                                                    {member.is_current_user && (
                                                        <span className="text-xs text-muted-foreground">
                                                            (you)
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-sm text-muted-foreground">
                                                    {member.email}
                                                </p>
                                                {member.timezone && (
                                                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />{' '}
                                                        {member.timezone}
                                                    </p>
                                                )}
                                                {member.last_seen_at && (
                                                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        Active{' '}
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                member.last_seen_at,
                                                            ),
                                                            { addSuffix: true },
                                                        )}
                                                    </p>
                                                )}
                                                {member.bio && (
                                                    <p className="mt-2 line-clamp-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
                                                        {member.bio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge
                                                variant={getRoleBadgeVariant(
                                                    member.role,
                                                )}
                                            >
                                                {member.role === 'owner' && (
                                                    <Crown className="mr-1 h-3 w-3" />
                                                )}
                                                {member.role === 'admin' && (
                                                    <Settings className="mr-1 h-3 w-3" />
                                                )}
                                                {member.role
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    member.role.slice(1)}
                                            </Badge>
                                            {isAdmin &&
                                                !member.is_current_user &&
                                                member.role !== 'owner' && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {member.role !==
                                                                'admin' && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        updateRole(
                                                                            member,
                                                                            'admin',
                                                                        )
                                                                    }
                                                                >
                                                                    <Shield className="mr-2 h-4 w-4" />
                                                                    {t(
                                                                        'team.promote_to_admin',
                                                                        'Promote to Admin',
                                                                    )}
                                                                </DropdownMenuItem>
                                                            )}
                                                            {member.role !==
                                                                'member' && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        updateRole(
                                                                            member,
                                                                            'member',
                                                                        )
                                                                    }
                                                                >
                                                                    <Settings className="mr-2 h-4 w-4" />
                                                                    {t(
                                                                        'team.set_role_member',
                                                                        'Set Role to Member',
                                                                    )}
                                                                </DropdownMenuItem>
                                                            )}
                                                            {member.role !==
                                                                'viewer' && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        updateRole(
                                                                            member,
                                                                            'viewer',
                                                                        )
                                                                    }
                                                                >
                                                                    <Users className="mr-2 h-4 w-4" />
                                                                    {t(
                                                                        'team.set_role_viewer',
                                                                        'Set Role to Viewer',
                                                                    )}
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            {[
                                                                'member',
                                                                'viewer',
                                                            ].includes(
                                                                member.role,
                                                            ) && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedMemberForPermissions(
                                                                            member,
                                                                        );
                                                                        setEditPermissionsOpen(
                                                                            true,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Shield className="mr-2 h-4 w-4" />
                                                                    {t(
                                                                        'team.manage_permissions',
                                                                        'Manage Permissions',
                                                                    )}
                                                                </DropdownMenuItem>
                                                            )}
                                                            {isOwner &&
                                                                member.role ===
                                                                    'admin' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            transferOwnership(
                                                                                member,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Crown className="mr-2 h-4 w-4" />
                                                                        {t(
                                                                            'team.transfer_ownership',
                                                                            'Transfer Ownership',
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() =>
                                                                    removeMember(
                                                                        member,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                {t(
                                                                    'team.remove',
                                                                    'Remove',
                                                                )}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bulk action bar */}
                            {isAdmin && selectedIds.size > 0 && (
                                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border bg-background p-3">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {selectedIds.size}{' '}
                                        {selectedIds.size !== 1
                                            ? t(
                                                  'team.members_selected',
                                                  'members selected',
                                              )
                                            : t(
                                                  'team.member_selected',
                                                  'member selected',
                                              )}
                                    </span>
                                    <div className="flex flex-1 flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={bulkRole}
                                                onValueChange={(v) =>
                                                    setBulkRole(
                                                        v as WorkspaceRole,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-8 w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">
                                                        {t(
                                                            'team.role_admin',
                                                            'Admin',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="member">
                                                        {t(
                                                            'team.role_member',
                                                            'Member',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="viewer">
                                                        {t(
                                                            'team.role_viewer',
                                                            'Viewer',
                                                        )}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    executeBulkAction(
                                                        'change_role',
                                                    )
                                                }
                                            >
                                                {t(
                                                    'team.change_role',
                                                    'Change Role',
                                                )}
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                executeBulkAction('remove')
                                            }
                                        >
                                            {t(
                                                'team.remove_selected',
                                                'Remove Selected',
                                            )}
                                        </Button>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={clearSelection}
                                    >
                                        {t('team.clear_selection', 'Clear')}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invite Links */}
                    {isAdmin && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Link2 className="h-5 w-5" />
                                            {t(
                                                'team.invite_links',
                                                'Invite Links',
                                            )}
                                        </CardTitle>
                                        <CardDescription>
                                            {t(
                                                'team.invite_links_desc',
                                                'Shareable links that let anyone join your workspace.',
                                            )}
                                        </CardDescription>
                                    </div>
                                    <Dialog
                                        open={linkDialogOpen}
                                        onOpenChange={setLinkDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!canInvite}
                                            >
                                                <Link2 className="mr-2 h-4 w-4" />
                                                {t(
                                                    'team.create_link',
                                                    'Create Link',
                                                )}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <form onSubmit={handleCreateLink}>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        {t(
                                                            'team.create_invite_link',
                                                            'Create Invite Link',
                                                        )}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        {t(
                                                            'team.create_invite_link_desc',
                                                            'Anyone with this link can join your workspace.',
                                                        )}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="link-role">
                                                            {t(
                                                                'team.role',
                                                                'Role',
                                                            )}
                                                        </Label>
                                                        <Select
                                                            value={
                                                                linkData.role
                                                            }
                                                            onValueChange={(
                                                                value: string,
                                                            ) =>
                                                                setLinkData(
                                                                    'role',
                                                                    value as WorkspaceRole,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        'team.role',
                                                                        'Role',
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="member">
                                                                    {t(
                                                                        'team.member',
                                                                        'Member',
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="admin">
                                                                    {t(
                                                                        'team.admin',
                                                                        'Admin',
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="viewer">
                                                                    {t(
                                                                        'team.viewer',
                                                                        'Viewer',
                                                                    )}
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="max-uses">
                                                            {t(
                                                                'team.max_uses',
                                                                'Max Uses',
                                                            )}{' '}
                                                            (
                                                            {t(
                                                                'common.optional',
                                                                'optional',
                                                            )}
                                                            )
                                                        </Label>
                                                        <Input
                                                            id="max-uses"
                                                            type="number"
                                                            min="1"
                                                            max="1000"
                                                            placeholder={t(
                                                                'team.unlimited',
                                                                'Unlimited',
                                                            )}
                                                            value={
                                                                linkData.max_uses
                                                            }
                                                            onChange={(e) =>
                                                                setLinkData(
                                                                    'max_uses',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="expires">
                                                            {t(
                                                                'team.expires_in',
                                                                'Expires In',
                                                            )}{' '}
                                                            (
                                                            {t(
                                                                'common.optional',
                                                                'optional',
                                                            )}
                                                            )
                                                        </Label>
                                                        <Select
                                                            value={String(
                                                                linkData.expires_in_days,
                                                            )}
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setLinkData(
                                                                    'expires_in_days',
                                                                    value === ''
                                                                        ? ''
                                                                        : Number(
                                                                              value,
                                                                          ),
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        'team.never',
                                                                        'Never',
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="">
                                                                    {t(
                                                                        'team.never',
                                                                        'Never',
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="1">
                                                                    1{' '}
                                                                    {t(
                                                                        'team.day',
                                                                        'day',
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="7">
                                                                    7{' '}
                                                                    {t(
                                                                        'team.days',
                                                                        'days',
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="14">
                                                                    14{' '}
                                                                    {t(
                                                                        'team.days',
                                                                        'days',
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="30">
                                                                    30{' '}
                                                                    {t(
                                                                        'team.days',
                                                                        'days',
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="90">
                                                                    90{' '}
                                                                    {t(
                                                                        'team.days',
                                                                        'days',
                                                                    )}
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setLinkDialogOpen(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        {t(
                                                            'common.cancel',
                                                            'Cancel',
                                                        )}
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            linkProcessing
                                                        }
                                                    >
                                                        {linkProcessing && (
                                                            <Spinner className="mr-2" />
                                                        )}
                                                        {t(
                                                            'team.create_link',
                                                            'Create Link',
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            {inviteLinks.length > 0 && (
                                <CardContent>
                                    <div className="space-y-3">
                                        {inviteLinks.map((link) => (
                                            <div
                                                key={link.id}
                                                className={`flex items-center justify-between rounded-lg border p-4 ${!link.is_usable ? 'opacity-50' : ''}`}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">
                                                            {link.role
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                link.role.slice(
                                                                    1,
                                                                )}
                                                        </Badge>
                                                        {!link.is_usable && (
                                                            <Badge variant="destructive">
                                                                {t(
                                                                    'team.inactive',
                                                                    'Inactive',
                                                                )}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span>
                                                            {link.uses_count}
                                                            {link.max_uses
                                                                ? `/${link.max_uses}`
                                                                : ''}{' '}
                                                            {t(
                                                                'team.uses',
                                                                'uses',
                                                            )}
                                                        </span>
                                                        {link.expires_at && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {t(
                                                                    'team.expires',
                                                                    'Expires',
                                                                )}{' '}
                                                                {new Date(
                                                                    link.expires_at,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {!link.expires_at && (
                                                            <span>
                                                                {t(
                                                                    'team.never_expires',
                                                                    'Never expires',
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {link.is_usable && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                copyLinkUrl(
                                                                    link,
                                                                )
                                                            }
                                                            title={t(
                                                                'team.copy_link',
                                                                'Copy Link',
                                                            )}
                                                        >
                                                            {copiedId ===
                                                            link.id ? (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            revokeLink(link)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    )}

                    {/* Pending Invitations */}
                    {isAdmin && pendingInvitations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    {t(
                                        'team.pending_invitations',
                                        'Pending Invitations',
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        'team.pending_invitations_desc',
                                        'Invitations that have been sent but not yet accepted.',
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {pendingInvitations.map((invitation) => {
                                        const isExpired =
                                            new Date(invitation.expires_at) <
                                            new Date();
                                        return (
                                            <div
                                                key={invitation.id}
                                                className={`flex items-center justify-between rounded-lg border border-dashed p-4 ${isExpired ? 'opacity-60' : ''}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Avatar>
                                                        <AvatarFallback>
                                                            <Mail className="h-4 w-4" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">
                                                            {invitation.email}
                                                        </p>
                                                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            {isExpired
                                                                ? t(
                                                                      'team.expired_on',
                                                                      'Expired',
                                                                  )
                                                                : t(
                                                                      'team.expires',
                                                                      'Expires',
                                                                  )}{' '}
                                                            {new Date(
                                                                invitation.expires_at,
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isExpired && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-xs"
                                                        >
                                                            {t(
                                                                'team.expired',
                                                                'Expired',
                                                            )}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline">
                                                        {invitation.role
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            invitation.role.slice(
                                                                1,
                                                            )}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.post(
                                                                `/team/invitations/${invitation.id}/resend`,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        {t(
                                                            'team.resend',
                                                            'Resend',
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            cancelInvitation(
                                                                invitation,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Manage Permissions Dialog */}
                    <Dialog
                        open={editPermissionsOpen}
                        onOpenChange={(open) => {
                            setEditPermissionsOpen(open);
                            if (!open)
                                setTimeout(
                                    () => setSelectedMemberForPermissions(null),
                                    200,
                                );
                        }}
                    >
                        <DialogContent>
                            <form onSubmit={handleUpdatePermissions}>
                                <DialogHeader>
                                    <DialogTitle>
                                        Manage Permissions
                                    </DialogTitle>
                                    <DialogDescription>
                                        Assign capability groups to{' '}
                                        {selectedMemberForPermissions?.name}.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    {permissionPresets.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                Apply Preset
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {permissionPresets.map(
                                                    (preset) => (
                                                        <Button
                                                            key={preset.id}
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setPermissionsData(
                                                                    'permissions',
                                                                    [
                                                                        ...preset.permissions,
                                                                    ],
                                                                )
                                                            }
                                                            title={
                                                                preset.description ||
                                                                undefined
                                                            }
                                                        >
                                                            {preset.name}
                                                        </Button>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {AVAILABLE_PERMISSION_GROUPS.map(
                                        (group) => (
                                            <div
                                                key={group.id}
                                                className="space-y-2"
                                            >
                                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                    {group.label}
                                                </p>
                                                <div className="space-y-3">
                                                    {group.permissions.map(
                                                        (permission) => (
                                                            <div
                                                                key={
                                                                    permission.id
                                                                }
                                                                className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4"
                                                            >
                                                                <Checkbox
                                                                    id={
                                                                        permission.id
                                                                    }
                                                                    checked={permissionsData.permissions.includes(
                                                                        permission.id,
                                                                    )}
                                                                    onCheckedChange={(
                                                                        checked,
                                                                    ) => {
                                                                        const updatedPermissions =
                                                                            checked
                                                                                ? [
                                                                                      ...permissionsData.permissions,
                                                                                      permission.id,
                                                                                  ]
                                                                                : permissionsData.permissions.filter(
                                                                                      (
                                                                                          p,
                                                                                      ) =>
                                                                                          p !==
                                                                                          permission.id,
                                                                                  );
                                                                        setPermissionsData(
                                                                            'permissions',
                                                                            updatedPermissions,
                                                                        );
                                                                    }}
                                                                />
                                                                <div className="space-y-1 leading-none">
                                                                    <Label
                                                                        htmlFor={
                                                                            permission.id
                                                                        }
                                                                    >
                                                                        {
                                                                            permission.label
                                                                        }
                                                                    </Label>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            permission.description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setEditPermissionsOpen(false)
                                        }
                                    >
                                        {t('common.cancel', 'Cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={permissionsProcessing}
                                    >
                                        {permissionsProcessing && (
                                            <Spinner className="mr-2" />
                                        )}
                                        {t('common.save', 'Save Changes')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </WorkspaceLayout>
        </AppLayout>
    );
}
