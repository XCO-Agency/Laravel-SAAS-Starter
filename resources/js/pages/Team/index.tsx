import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type TeamMember, type Workspace, type WorkspaceInvitation, type WorkspaceRole } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Clock, Crown, Mail, MoreHorizontal, Settings, Trash2, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

interface TeamIndexProps {
    workspace: Workspace;
    members: TeamMember[];
    pendingInvitations: WorkspaceInvitation[];
    userRole: WorkspaceRole;
    canInvite: boolean;
    memberLimitMessage: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Team', href: '/team' },
];

export default function TeamIndex({
    workspace,
    members,
    pendingInvitations,
    userRole,
    canInvite,
    memberLimitMessage,
}: TeamIndexProps) {
    const [inviteOpen, setInviteOpen] = useState(false);
    const isAdmin = userRole === 'owner' || userRole === 'admin';
    const isOwner = userRole === 'owner';

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
        router.put(`/team/members/${member.id}/role`, { role }, {
            preserveScroll: true,
        });
    };

    const removeMember = (member: TeamMember) => {
        if (confirm(`Are you sure you want to remove ${member.name} from this workspace?`)) {
            router.delete(`/team/members/${member.id}`, {
                preserveScroll: true,
            });
        }
    };

    const transferOwnership = (member: TeamMember) => {
        if (confirm(`Are you sure you want to transfer ownership to ${member.name}? You will become an admin.`)) {
            router.post(`/team/transfer-ownership/${member.id}`, {}, {
                preserveScroll: true,
            });
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
            <Head title="Team" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Team"
                        description={`Manage team members in ${workspace.name}.`}
                    />
                    {isAdmin && (
                        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                            <DialogTrigger asChild>
                                <Button disabled={!canInvite}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Invite Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleInvite}>
                                    <DialogHeader>
                                        <DialogTitle>Invite Team Member</DialogTitle>
                                        <DialogDescription>
                                            Send an invitation to join your workspace.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="colleague@example.com"
                                                value={inviteData.email}
                                                onChange={(e) => setInviteData('email', e.target.value)}
                                                required
                                            />
                                            <InputError message={inviteErrors.email} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Select
                                                value={inviteData.role}
                                                onValueChange={(value: 'admin' | 'member') =>
                                                    setInviteData('role', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="member">Member</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Admins can manage team members and workspace settings.
                                            </p>
                                            <InputError message={inviteErrors.role} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setInviteOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={inviteProcessing}>
                                            {inviteProcessing && <Spinner className="mr-2" />}
                                            Send Invitation
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <p className="text-sm text-muted-foreground">{memberLimitMessage}</p>

                {/* Team Members */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Members
                        </CardTitle>
                        <CardDescription>
                            {members.length} member{members.length !== 1 ? 's' : ''} in this workspace
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
                                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{member.name}</p>
                                                {member.is_current_user && (
                                                    <span className="text-xs text-muted-foreground">
                                                        (you)
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={getRoleBadgeVariant(member.role)}>
                                            {member.role === 'owner' && (
                                                <Crown className="mr-1 h-3 w-3" />
                                            )}
                                            {member.role === 'admin' && (
                                                <Settings className="mr-1 h-3 w-3" />
                                            )}
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </Badge>
                                        {isAdmin && !member.is_current_user && member.role !== 'owner' && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            updateRole(
                                                                member,
                                                                member.role === 'admin' ? 'member' : 'admin'
                                                            )
                                                        }
                                                    >
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        {member.role === 'admin'
                                                            ? 'Change to Member'
                                                            : 'Make Admin'}
                                                    </DropdownMenuItem>
                                                    {isOwner && member.role === 'admin' && (
                                                        <DropdownMenuItem
                                                            onClick={() => transferOwnership(member)}
                                                        >
                                                            <Crown className="mr-2 h-4 w-4" />
                                                            Transfer Ownership
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => removeMember(member)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove
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
                                Pending Invitations
                            </CardTitle>
                            <CardDescription>
                                {pendingInvitations.length} pending invitation
                                {pendingInvitations.length !== 1 ? 's' : ''}
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
                                                <p className="font-medium">{invitation.email}</p>
                                                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    Expires{' '}
                                                    {new Date(invitation.expires_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline">
                                                {invitation.role.charAt(0).toUpperCase() +
                                                    invitation.role.slice(1)}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => cancelInvitation(invitation)}
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
            </div>
        </AppLayout>
    );
}

