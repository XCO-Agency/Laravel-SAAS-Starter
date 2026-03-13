import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type WorkspaceRole } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, LogOut, ShieldAlert, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface WorkspaceDangerZoneProps {
    workspace: {
        id: number;
        name: string;
        personal_workspace: boolean;
        owner_id: number;
    };
    userRole: WorkspaceRole;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Workspace Settings', href: '/workspaces/settings' },
    { title: 'Danger Zone', href: '/settings/workspace-danger-zone' },
];

export default function WorkspaceDangerZone({ workspace, userRole }: WorkspaceDangerZoneProps) {
    const { t } = useTranslations();
    const { props } = usePage();
    const flash = props.flash as { error?: string; success?: string } | undefined;
    const isOwner = userRole === 'owner';
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const handleDelete = () => {
        if (deleteConfirm !== workspace.name) {
            return;
        }
        router.delete('/workspaces', { preserveScroll: true });
    };

    const handleLeave = () => {
        router.delete('/workspaces/leave', { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('danger_zone.title', 'Danger Zone')} />

            <SettingsLayout
                title={t('danger_zone.title', 'Danger Zone')}
                description={t('danger_zone.description', 'Irreversible actions for this workspace. Please proceed with caution.')}
            >
                <div className="space-y-6">
                    {flash?.error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {flash.error}
                        </div>
                    )}

                    {/* Transfer Ownership (owners only) */}
                    {isOwner && !workspace.personal_workspace && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    {t('danger_zone.transfer_ownership', 'Transfer Ownership')}
                                </CardTitle>
                                <CardDescription>
                                    {t('danger_zone.transfer_ownership_desc', 'Hand over ownership of this workspace to another member.')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" asChild>
                                    <Link href="/team">
                                        {t('danger_zone.go_to_team', 'Manage Team & Transfer')}
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Leave Workspace (non-owners only) */}
                    {!isOwner && !workspace.personal_workspace && (
                        <Card className="border-amber-200 dark:border-amber-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
                                    <LogOut className="h-5 w-5" />
                                    {t('danger_zone.leave_workspace', 'Leave Workspace')}
                                </CardTitle>
                                <CardDescription>
                                    {t('danger_zone.leave_workspace_desc', 'You will lose access to this workspace immediately.')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!showLeaveConfirm ? (
                                    <Button
                                        variant="outline"
                                        className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30"
                                        onClick={() => setShowLeaveConfirm(true)}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        {t('danger_zone.leave_workspace', 'Leave Workspace')}
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm text-amber-700 dark:text-amber-400">
                                            {t('danger_zone.leave_confirm_text', 'Are you sure you want to leave {{name}}?', { name: workspace.name })}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleLeave}
                                            >
                                                {t('danger_zone.confirm_leave', 'Yes, leave workspace')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowLeaveConfirm(false)}
                                            >
                                                {t('common.cancel', 'Cancel')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Delete Workspace (owners only) */}
                    {isOwner && !workspace.personal_workspace && (
                        <Card className="border-red-200 dark:border-red-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base text-red-700 dark:text-red-400">
                                    <Trash2 className="h-5 w-5" />
                                    {t('danger_zone.delete_workspace', 'Delete Workspace')}
                                </CardTitle>
                                <CardDescription>
                                    {t('danger_zone.delete_workspace_desc', 'Permanently delete this workspace and all its data. This action cannot be undone.')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!showDeleteForm ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => setShowDeleteForm(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t('danger_zone.delete_workspace', 'Delete Workspace')}
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
                                            <p className="text-sm text-red-700 dark:text-red-400">
                                                {t('danger_zone.delete_warning', 'This will permanently delete the workspace, all members, API keys, and webhooks. Type the workspace name to confirm.')}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="workspace-name-confirm" className="text-sm font-medium">
                                                {t('danger_zone.type_workspace_name', 'Type')} <span className="font-semibold">{workspace.name}</span> {t('danger_zone.to_confirm', 'to confirm')}
                                            </Label>
                                            <Input
                                                id="workspace-name-confirm"
                                                value={deleteConfirm}
                                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                                placeholder={workspace.name}
                                                className="border-red-300 dark:border-red-800"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="destructive"
                                                disabled={deleteConfirm !== workspace.name}
                                                onClick={handleDelete}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {t('danger_zone.confirm_delete', 'Delete permanently')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => { setShowDeleteForm(false); setDeleteConfirm(''); }}
                                            >
                                                {t('common.cancel', 'Cancel')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Personal workspace notice */}
                    {workspace.personal_workspace && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                                    {t('danger_zone.personal_workspace', 'Personal Workspace')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {t('danger_zone.personal_workspace_notice', 'Personal workspaces cannot be deleted or left. They are tied to your account.')}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
