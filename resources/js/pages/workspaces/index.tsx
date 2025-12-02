import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Workspace } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, Crown, Plus, Settings, Users } from 'lucide-react';

interface WorkspaceListItem extends Workspace {
    owner?: { id: number; name: string };
}

interface WorkspacesIndexProps {
    workspaces: WorkspaceListItem[];
    canCreateWorkspace: boolean;
    workspaceLimitMessage: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Workspaces', href: '/workspaces' },
];

export default function WorkspacesIndex({
    workspaces,
    canCreateWorkspace,
    workspaceLimitMessage,
}: WorkspacesIndexProps) {
    const switchWorkspace = (workspace: WorkspaceListItem) => {
        router.post(`/workspaces/${workspace.id}/switch`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workspaces" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Workspaces"
                        description="Manage your workspaces and collaborate with your team."
                    />
                    {canCreateWorkspace ? (
                        <Button asChild>
                            <Link href="/workspaces/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Workspace
                            </Link>
                        </Button>
                    ) : (
                        <Button disabled title={workspaceLimitMessage}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Workspace
                        </Button>
                    )}
                </div>

                <p className="text-sm text-muted-foreground">
                    {workspaceLimitMessage}
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {workspaces.map((workspace) => (
                        <Card
                            key={workspace.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                                workspace.is_current
                                    ? 'ring-2 ring-primary'
                                    : ''
                            }`}
                            onClick={() => switchWorkspace(workspace)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {workspace.logo_url ? (
                                            <img
                                                src={workspace.logo_url}
                                                alt={workspace.name}
                                                className="h-10 w-10 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                        )}
                                        <div>
                                            <CardTitle className="text-base">
                                                {workspace.name}
                                            </CardTitle>
                                            {workspace.personal_workspace && (
                                                <span className="text-xs text-muted-foreground">
                                                    Personal
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {workspace.is_current && (
                                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                            Current
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {workspace.members_count} members
                                    </span>
                                    <span className="flex items-center gap-1">
                                        {workspace.role === 'owner' && (
                                            <>
                                                <Crown className="h-4 w-4 text-yellow-500" />
                                                Owner
                                            </>
                                        )}
                                        {workspace.role === 'admin' && (
                                            <>
                                                <Settings className="h-4 w-4" />
                                                Admin
                                            </>
                                        )}
                                        {workspace.role === 'member' && (
                                            <>Member</>
                                        )}
                                    </span>
                                </CardDescription>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                                        {workspace.plan} Plan
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {workspaces.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-medium">
                                No workspaces yet
                            </h3>
                            <p className="mb-4 text-center text-muted-foreground">
                                Create your first workspace to get started.
                            </p>
                            {canCreateWorkspace && (
                                <Button asChild>
                                    <Link href="/workspaces/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Workspace
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
