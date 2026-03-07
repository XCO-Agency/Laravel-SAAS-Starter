import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MonitorSmartphone, XCircle, Trash2 } from 'lucide-react';

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
        if (confirm('Are you sure you want to terminate this session? The user will be logged out on that device.')) {
            router.delete(`/admin/users/${user.id}/sessions/${sessionId}`, { preserveScroll: true });
        }
    };

    const revokeAllSessions = () => {
        if (confirm('Are you sure you want to terminate ALL sessions for this user? They will be entirely logged out.')) {
            router.delete(`/admin/users/${user.id}/sessions`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title={`Sessions - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 rounded-xl border border-sidebar-border/70">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
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
                            Viewing active sessions for <strong>{user.name}</strong> ({user.email})
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {sessions.length > 0 && (
                            <Button variant="destructive" onClick={revokeAllSessions}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Terminate All Sessions
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-medium">Device / Browser</th>
                                <th className="px-6 py-3 font-medium">IP Address</th>
                                <th className="px-6 py-3 font-medium">Last Active</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sessions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        No active sessions found for this user.
                                    </td>
                                </tr>
                            ) : (
                                sessions.map((session) => (
                                    <tr key={session.id} className={`transition-colors hover:bg-muted/50 ${session.is_current_device ? 'bg-primary/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    {session.user_agent ? (
                                                        <span className="truncate max-w-[300px]" title={session.user_agent}>
                                                            {session.user_agent.split(' ').slice(0, 3).join(' ')}...
                                                        </span>
                                                    ) : (
                                                        'Unknown Device'
                                                    )}
                                                    {session.is_current_device && (
                                                        <Badge variant="default" className="text-[10px] h-5 px-1.5">This Admin Session</Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground truncate max-w-[400px]" title={session.user_agent}>
                                                    {session.user_agent || 'No user agent provided'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {session.ip_address || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {session.last_activity}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end">
                                            {!session.is_current_device && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => revokeSession(session.id)}
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
