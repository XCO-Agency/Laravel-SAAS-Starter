import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface SuspendedWorkspace {
    name: string;
    suspended_at: string;
    suspension_reason: string | null;
}

interface WorkspaceSuspendedProps {
    workspace: SuspendedWorkspace;
}

export default function WorkspaceSuspended({ workspace }: WorkspaceSuspendedProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Workspace Suspended', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workspace Suspended" />

            <div className="flex items-center justify-center py-16">
                <Card className="w-full max-w-lg border-destructive/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="text-xl">Workspace Suspended</CardTitle>
                        <CardDescription>
                            <strong>{workspace.name}</strong> has been suspended
                            {workspace.suspended_at && (
                                <> on {new Date(workspace.suspended_at).toLocaleDateString()}</>
                            )}
                            .
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        {workspace.suspension_reason && (
                            <div className="rounded-lg bg-muted p-4 text-left text-sm">
                                <p className="mb-1 font-medium">Reason:</p>
                                <p className="text-muted-foreground">{workspace.suspension_reason}</p>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Contact your administrator or support team to resolve this issue and restore access.
                        </p>
                        <Button variant="outline" asChild>
                            <Link href="/workspaces">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Switch Workspace
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
