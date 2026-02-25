import InputError from '@/components/input-error';
import { useTranslations } from '@/hooks/use-translations';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import {
    type BreadcrumbItem,
    type TeamMember,
    type Workspace,
    type WorkspaceInvitation,
    type WorkspaceRole,
} from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Clock,
    Crown,
    Mail,
    MoreHorizontal,
    Settings,
    Shield,
    Trash2,
    UserPlus,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const AVAILABLE_PERMISSIONS = [
    { id: 'manage_team', label: 'Manage Team', description: 'Can invite, remove, and manage team members.' },
    { id: 'manage_billing', label: 'Manage Billing', description: 'Can subscribe or cancel plans.' },
    { id: 'manage_webhooks', label: 'Manage Webhooks', description: 'Can create and configure webhook endpoints.' },
    { id: 'view_activity_logs', label: 'View Activity Logs', description: 'Can view audit logs and events.' }
];

interface TeamIndexProps {
    workspace: Workspace;
    members: TeamMember[];
    pendingInvitations: WorkspaceInvitation[];
    userRole: WorkspaceRole;
    canInvite: boolean;
    memberLimitMessage: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Team', href: '/team' }];

export default function TeamIndex({
    workspace,
    members,
    pendingInvitations,
    userRole,
    canInvite,
    memberLimitMessage,
}: TeamIndexProps) {
    const [inviteOpen, setInviteOpen] = useState(false);
    const { t } = useTranslations();
    const isAdmin = userRole === 'owner' || userRole === 'admin';
    const isOwner = userRole === 'owner';

    const [editPermissionsOpen, setEditPermissionsOpen] = useState(false);
    const [selectedMemberForPermissions, setSelectedMemberForPermissions] = useState<TeamMember | null>(null);

    const {
        data: permissionsData,
        setData: setPermissionsData,
        processing: permissionsProcessing,
    } = useForm({
        permissions: [] as string[],
    });

    useEffect(() => {
        if (selectedMemberForPermissions) {
            setPermissionsData('permissions', selectedMemberForPermissions.permissions || []);
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
                    setTimeout(() => setSelectedMemberForPermissions(null), 200);
                },
            }
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
        role: 'member' as 'admin' | 'member',
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

    const updateRole = (member: TeamMember, role: 'admin' | 'member') => {
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

            <SettingsLayout
                title={t('team.title', 'Team')}
                description={t('team.description', 'Manage team members in {{workspace}}.', { workspace: workspace.name })}
                fullWidth
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-end">
                        {isAdmin && (
                            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                                <DialogTrigger asChild>
                                    <Button disabled={!canInvite}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {t('team.invite_member', 'Invite Member')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleInvite}>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {t('team.invite_new_member', 'Invite New Member')}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {t('team.invite_description', 'Enter the email address and role for the new team member.')}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    {t('team.email_address', 'Email Address')}
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder={t('team.member_email_placeholder', 'colleague@example.com')}
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
                                                <Label htmlFor="role">{t('team.role', 'Role')}</Label>
                                                <Select
                                                    value={inviteData.role}
                                                    onValueChange={(
                                                        value: 'admin' | 'member',
                                                    ) =>
                                                        setInviteData('role', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('team.role', 'Role')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="member">
                                                            {t('team.member', 'Member')}
                                                        </SelectItem>
                                                        <SelectItem value="admin">
                                                            {t('team.admin', 'Admin')}
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    {t('team.role_description', 'Admins can manage team members and workspace settings.')}
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
                                                onClick={() => setInviteOpen(false)}
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
                                                {t('team.send_invitation', 'Send Invitation')}
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
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                {t('team.team_members', 'Team Members')}
                            </CardTitle>
                            <CardDescription>
                                {t('team.team_members_desc', 'All members currently in your workspace.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex items-center gap-4">
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
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {member.email}
                                                </p>
                                                {member.timezone && (
                                                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" /> {member.timezone}
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
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    updateRole(
                                                                        member,
                                                                        member.role ===
                                                                            'admin'
                                                                            ? 'member'
                                                                            : 'admin',
                                                                    )
                                                                }
                                                            >
                                                                <Settings className="mr-2 h-4 w-4" />
                                                                {member.role ===
                                                                    'admin'
                                                                    ? t('team.demote_to_member', 'Demote to Member')
                                                                    : t('team.promote_to_admin', 'Promote to Admin')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {member.role === 'member' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedMemberForPermissions(member);
                                                                        setEditPermissionsOpen(true);
                                                                    }}
                                                                >
                                                                    <Shield className="mr-2 h-4 w-4" />
                                                                    {t('team.manage_permissions', 'Manage Permissions')}
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
                                                                        {t('team.transfer_ownership', 'Transfer Ownership')}
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
                                                                {t('team.remove', 'Remove')}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Invitations */}
                    {isAdmin && pendingInvitations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    {t('team.pending_invitations', 'Pending Invitations')}
                                </CardTitle>
                                <CardDescription>
                                    {t('team.pending_invitations_desc', 'Invitations that have been sent but not yet accepted.')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {pendingInvitations.map((invitation) => (
                                        <div
                                            key={invitation.id}
                                            className="flex items-center justify-between rounded-lg border border-dashed p-4"
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
                                                        {t('team.expires', 'Expires')}{' '}
                                                        {new Date(
                                                            invitation.expires_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline">
                                                    {invitation.role
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        invitation.role.slice(1)}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        cancelInvitation(invitation)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Manage Permissions Dialog */}
                    <Dialog open={editPermissionsOpen} onOpenChange={(open) => {
                        setEditPermissionsOpen(open);
                        if (!open) setTimeout(() => setSelectedMemberForPermissions(null), 200);
                    }}>
                        <DialogContent>
                            <form onSubmit={handleUpdatePermissions}>
                                <DialogHeader>
                                    <DialogTitle>
                                        Manage Permissions
                                    </DialogTitle>
                                    <DialogDescription>
                                        Assign granular capabilities to {selectedMemberForPermissions?.name}.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    {AVAILABLE_PERMISSIONS.map((permission) => (
                                        <div key={permission.id} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <Checkbox
                                                id={permission.id}
                                                checked={permissionsData.permissions.includes(permission.id)}
                                                onCheckedChange={(checked) => {
                                                    const updatedPermissions = checked
                                                        ? [...permissionsData.permissions, permission.id]
                                                        : permissionsData.permissions.filter((p) => p !== permission.id);
                                                    setPermissionsData('permissions', updatedPermissions);
                                                }}
                                            />
                                            <div className="space-y-1 leading-none">
                                                <Label htmlFor={permission.id}>
                                                    {permission.label}
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {permission.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditPermissionsOpen(false)}
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
            </SettingsLayout>
        </AppLayout>
    );
}
