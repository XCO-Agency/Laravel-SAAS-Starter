import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TrashedWorkspace {
    id: number;
    name: string;
    slug: string;
    deleted_at: string;
    days_remaining: number;
    logo_url: string | null;
}

interface WorkspaceTrashProps {
    trashedWorkspaces: TrashedWorkspace[];
}

export default function WorkspaceTrash({ trashedWorkspaces }: WorkspaceTrashProps) {
    const [confirmDelete, setConfirmDelete] = useState<TrashedWorkspace | null>(null);
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Workspaces', href: '/workspaces' },
        { title: 'Trash', href: '/workspaces/trash' },
    ];

    const handleRestore = (workspace: TrashedWorkspace) => {
        setProcessing(true);
        router.post(`/workspaces/trash/${workspace.id}/restore`, {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleForceDelete = () => {
        if (!confirmDelete) return;
        setProcessing(true);
        router.delete(`/workspaces/trash/${confirmDelete.id}`, {
            onFinish: () => {
                setProcessing(false);
                setConfirmDelete(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trash" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Trash"
                        description="Restore or permanently delete workspaces. Trashed workspaces are automatically removed after 30 days."
                    />
                    <Button variant="outline" asChild>
                        <Link href="/workspaces">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Workspaces
                        </Link>
                    </Button>
                </div>

                {trashedWorkspaces.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Trash2 className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-medium">Trash is empty</h3>
                            <p className="text-center text-muted-foreground">
                                Deleted workspaces will appear here for 30 days before being permanently removed.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {trashedWorkspaces.map((workspace) => (
                            <Card key={workspace.id} className="border-dashed">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {workspace.logo_url ? (
                                                <img
                                                    src={workspace.logo_url}
                                                    alt={workspace.name}
                                                    className="h-10 w-10 rounded-lg object-cover opacity-60 grayscale"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <Trash2 className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div>
                                                <CardTitle className="text-base text-muted-foreground line-through">
                                                    {workspace.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    Deleted {new Date(workspace.deleted_at).toLocaleDateString()} · {workspace.days_remaining} days remaining
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={processing}
                                                onClick={() => handleRestore(workspace)}
                                            >
                                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                                Restore
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                disabled={processing}
                                                onClick={() => setConfirmDelete(workspace)}
                                            >
                                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                                Delete Forever
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Permanently delete workspace?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete <strong>{confirmDelete?.name}</strong> and all associated data.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={processing}
                            onClick={handleForceDelete}
                        >
                            {processing ? 'Deleting...' : 'Delete Forever'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
