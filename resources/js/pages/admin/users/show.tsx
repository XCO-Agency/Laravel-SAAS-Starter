import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Activity, ArrowLeft, Shield, UserCog } from 'lucide-react';

interface UserDetail {
    id: number;
    name: string;
    email: string;
    is_superadmin: boolean;
    created_at: string;
    deleted_at: string | null;
    email_verified_at: string | null;
}

interface ImpersonationEntry {
    id: number;
    impersonator_name: string;
    impersonator_email: string;
    ip_address: string | null;
    started_at: string;
    ended_at: string | null;
}

interface ActivityEntry {
    id: number;
    event: string;
    description: string;
    causer_name: string;
    created_at: string;
}

interface Props {
    user: UserDetail;
    impersonationLogs: ImpersonationEntry[];
    activityLog: ActivityEntry[];
}

export default function AdminUserShow({
    user,
    impersonationLogs,
    activityLog,
}: Props) {
    return (
        <AdminLayout>
            <Head title={`User: ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back to Users
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {user.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {user.is_superadmin && (
                            <Badge variant="destructive">
                                <Shield className="mr-1 h-3 w-3" />
                                Superadmin
                            </Badge>
                        )}
                        {user.deleted_at && (
                            <Badge
                                variant="outline"
                                className="border-red-300 text-red-600"
                            >
                                Suspended
                            </Badge>
                        )}
                        {!user.email_verified_at && (
                            <Badge variant="outline">Unverified</Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Impersonation History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCog className="h-4 w-4" />
                                Impersonation History
                            </CardTitle>
                            <CardDescription>
                                Times an admin has impersonated this user.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {impersonationLogs.length === 0 ? (
                                <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                                    <p className="text-sm text-muted-foreground">
                                        No impersonation history.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {impersonationLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="rounded-md border p-3 text-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">
                                                    {log.impersonator_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            log.started_at,
                                                        ),
                                                        { addSuffix: true },
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {log.impersonator_email}
                                                {log.ip_address &&
                                                    ` · ${log.ip_address}`}
                                                {log.ended_at &&
                                                    ` · ended ${formatDistanceToNow(new Date(log.ended_at), { addSuffix: true })}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity Log */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>
                                Latest audit log entries for this user.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activityLog.length === 0 ? (
                                <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                                    <p className="text-sm text-muted-foreground">
                                        No activity logged.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activityLog.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="rounded-md border p-3 text-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium capitalize">
                                                    {entry.event ?? 'action'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {entry.created_at &&
                                                        formatDistanceToNow(
                                                            new Date(
                                                                entry.created_at,
                                                            ),
                                                            { addSuffix: true },
                                                        )}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {entry.description} · by{' '}
                                                {entry.causer_name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
