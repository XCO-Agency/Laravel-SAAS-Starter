import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    LogOut,
    Monitor,
    Shield,
    Smartphone,
    Tablet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SessionSummaryData {
    total_sessions: number;
    other_sessions_count: number;
    current_session: {
        id: string;
        ip_address: string;
        device: string;
        platform: string;
        browser: string;
        last_active: string;
    } | null;
    last_other_activity: {
        ip_address: string;
        device: string;
        platform: string;
        last_active: string;
    } | null;
}

const DeviceIcon = ({ device }: { device: string }) => {
    switch (device) {
        case 'mobile':
            return <Smartphone className="h-4 w-4" />;
        case 'tablet':
            return <Tablet className="h-4 w-4" />;
        default:
            return <Monitor className="h-4 w-4" />;
    }
};

export function SessionSummaryCard() {
    const [data, setData] = useState<SessionSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [signingOut, setSigningOut] = useState(false);

    useEffect(() => {
        fetch('/settings/session-summary', {
            headers: { Accept: 'application/json' },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load session summary');
                return res.json();
            })
            .then((data: SessionSummaryData) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleSignOutOthers = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setSigningOut(true);
        const csrf =
            document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                ?.content ?? '';

        try {
            const res = await fetch('/settings/sessions', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                setShowSignOutDialog(false);
                setPassword('');
                // Refresh data
                const fresh = await fetch('/settings/session-summary', {
                    headers: { Accept: 'application/json' },
                }).then((r) => r.json());
                setData(fresh);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to sign out other sessions');
            }
        } catch {
            alert('An error occurred');
        } finally {
            setSigningOut(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center py-8">
                        <Spinner className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <p className="text-sm">
                            Failed to load session summary
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const {
        total_sessions,
        other_sessions_count,
        current_session,
        last_other_activity,
    } = data;

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Active Sessions
                            </CardTitle>
                            <CardDescription>
                                Manage your active sessions across devices
                            </CardDescription>
                        </div>
                        <Badge
                            variant={
                                other_sessions_count > 0
                                    ? 'secondary'
                                    : 'outline'
                            }
                        >
                            {total_sessions} active
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Current Session */}
                    {current_session && (
                        <div className="flex items-start gap-4 rounded-lg border bg-muted/50 p-4">
                            <div className="rounded-full bg-green-100 p-2 dark:bg-green-950">
                                <DeviceIcon device={current_session.device} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                        Current Session
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="border-green-200 text-green-600 dark:border-green-800"
                                    >
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Active
                                    </Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {current_session.platform} •{' '}
                                    {current_session.browser}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    IP: {current_session.ip_address} •{' '}
                                    {current_session.last_active}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Other Sessions Summary */}
                    {other_sessions_count > 0 ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
                                        {other_sessions_count} other active
                                        session
                                        {other_sessions_count !== 1 && 's'}
                                    </p>
                                    {last_other_activity && (
                                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                                            Last activity:{' '}
                                            {last_other_activity.platform} •{' '}
                                            {last_other_activity.device} •{' '}
                                            {last_other_activity.last_active}
                                        </p>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50"
                                        onClick={() =>
                                            router.get('/settings/sessions')
                                        }
                                    >
                                        View All Sessions
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <p className="text-sm text-green-800 dark:text-green-300">
                                No other active sessions. Your account is
                                secure.
                            </p>
                        </div>
                    )}

                    {/* Sign Out Others Button */}
                    {other_sessions_count > 0 && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowSignOutDialog(true)}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out All Other Devices
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Sign Out Others Dialog */}
            <Dialog
                open={showSignOutDialog}
                onOpenChange={setShowSignOutDialog}
            >
                <DialogContent>
                    <form onSubmit={handleSignOutOthers}>
                        <DialogHeader>
                            <DialogTitle>
                                Sign Out All Other Devices
                            </DialogTitle>
                            <DialogDescription>
                                This will immediately sign you out of all other
                                active sessions. Enter your password to confirm.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="mt-2"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowSignOutDialog(false)}
                                disabled={signingOut}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={signingOut || !password}
                            >
                                {signingOut && (
                                    <Spinner className="mr-2 h-4 w-4" />
                                )}
                                Sign Out All Others
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
