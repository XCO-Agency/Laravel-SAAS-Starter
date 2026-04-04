import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, MonitorSmartphone, Trash2, XCircle } from 'lucide-react';

interface Session {
    id: string;
    ip_address: string;
    user_agent: string;
    last_activity: string;
    is_current_device: boolean;
}

interface UserSessionsProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
    sessions: Session[];
}

export default function UserSessions({ user, sessions }: UserSessionsProps) {
    const revokeSession = (sessionId: string) => {
        if (
            confirm(
                'Are you sure you want to terminate this session? The user will be logged out on that device.',
            )
        ) {
            router.delete(`/admin/users/${user.id}/sessions/${sessionId}`, {
                preserveScroll: true,
            });
        }
    };

    const revokeAllSessions = () => {
        if (
            confirm(
                'Are you sure you want to terminate ALL sessions for this user? They will be entirely logged out.',
            )
        ) {
            router.delete(`/admin/users/${user.id}/sessions`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout>
            <Head title={`Sessions - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-md border border-sidebar-border/70 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 text-muted-foreground"
                                onClick={() => router.get('/admin/users')}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Button>
                        </div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <MonitorSmartphone className="h-6 w-6" />
                            Active Sessions
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Viewing active sessions for{' '}
                            <strong>{user.name}</strong> ({user.email})
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {sessions.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={revokeAllSessions}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Terminate All Sessions
                            </Button>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden rounded-md border bg-card text-card-foreground shadow">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">
                                    Device / Browser
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    IP Address
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Last Active
                                </th>
                                <th className="px-6 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sessions.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-muted-foreground"
                                    >
                                        No active sessions found for this user.
                                    </td>
                                </tr>
                            ) : (
                                sessions.map((session) => (
                                    <tr
                                        key={session.id}
                                        className={`transition-colors hover:bg-muted/50 ${session.is_current_device ? 'bg-primary/5' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 font-medium">
                                                    {session.user_agent ? (
                                                        <span
                                                            className="max-w-[300px] truncate"
                                                            title={
                                                                session.user_agent
                                                            }
                                                        >
                                                            {session.user_agent
                                                                .split(' ')
                                                                .slice(0, 3)
                                                                .join(' ')}
                                                            ...
                                                        </span>
                                                    ) : (
                                                        'Unknown Device'
                                                    )}
                                                    {session.is_current_device && (
                                                        <Badge
                                                            variant="default"
                                                            className="h-5 px-1.5 text-[10px]"
                                                        >
                                                            This Admin Session
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span
                                                    className="max-w-[400px] truncate text-xs text-muted-foreground"
                                                    title={session.user_agent}
                                                >
                                                    {session.user_agent ||
                                                        'No user agent provided'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {session.ip_address || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {session.last_activity}
                                        </td>
                                        <td className="flex justify-end px-6 py-4 text-right">
                                            {!session.is_current_device && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        revokeSession(
                                                            session.id,
                                                        )
                                                    }
                                                >
                                                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                                    Revoke
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
