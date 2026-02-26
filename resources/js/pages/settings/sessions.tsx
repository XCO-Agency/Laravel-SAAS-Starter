import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { useState } from 'react';

interface Session {
    id: string;
    ip_address: string;
    device: 'desktop' | 'mobile' | 'tablet';
    platform: string;
    browser: string;
    is_current: boolean;
    last_active: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sessions',
        href: '/settings/sessions',
    },
];

const DeviceIcon = ({ device }: { device: string }) => {
    switch (device) {
        case 'mobile':
            return <Smartphone className="h-5 w-5" />;
        case 'tablet':
            return <Tablet className="h-5 w-5" />;
        default:
            return <Monitor className="h-5 w-5" />;
    }
};

export default function Sessions({ sessions }: { sessions: Session[] }) {
    const { t } = useTranslations();
    const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
    const [revokeAllOpen, setRevokeAllOpen] = useState(false);

    const revokeForm = useForm({ password: '' });
    const revokeAllForm = useForm({ password: '' });

    const handleRevoke = () => {
        if (!revokeTarget) {
            return;
        }
        revokeForm.delete(`/settings/sessions/${revokeTarget}`, {
            preserveScroll: true,
            onSuccess: () => {
                setRevokeTarget(null);
                revokeForm.reset();
            },
        });
    };

    const handleRevokeAll = () => {
        revokeAllForm.delete('/settings/sessions', {
            preserveScroll: true,
            onSuccess: () => {
                setRevokeAllOpen(false);
                revokeAllForm.reset();
            },
        });
    };

    const otherSessions = sessions.filter((s) => !s.is_current);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sessions.title', 'Sessions')} />

            <SettingsLayout
                title={t('sessions.title', 'Sessions')}
                description={t('sessions.description', 'Manage your active browser sessions and revoke access.')}
                fullWidth
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{t('sessions.active_sessions', 'Active Sessions')}</CardTitle>
                                <CardDescription>
                                    {t(
                                        'sessions.active_sessions_description',
                                        'These are the devices currently logged into your account.',
                                    )}
                                </CardDescription>
                            </div>
                            {otherSessions.length > 0 && (
                                <Button variant="destructive" size="sm" onClick={() => setRevokeAllOpen(true)}>
                                    {t('sessions.revoke_all', 'Revoke All Others')}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <DeviceIcon device={session.device} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {session.browser} on {session.platform}
                                                </span>
                                                {session.is_current && (
                                                    <Badge variant="default" className="text-xs">
                                                        {t('sessions.current', 'This device')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {session.ip_address} · {session.last_active}
                                            </p>
                                        </div>
                                    </div>
                                    {!session.is_current && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setRevokeTarget(session.id)}
                                        >
                                            {t('sessions.revoke', 'Revoke')}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Revoke Single Session Dialog */}
                <Dialog open={!!revokeTarget} onOpenChange={() => setRevokeTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('sessions.revoke_session', 'Revoke Session')}</DialogTitle>
                            <DialogDescription>
                                {t(
                                    'sessions.revoke_session_description',
                                    'Enter your password to revoke this session. The device will be logged out immediately.',
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="revoke-password">{t('sessions.password', 'Password')}</Label>
                                <Input
                                    id="revoke-password"
                                    type="password"
                                    value={revokeForm.data.password}
                                    onChange={(e) => revokeForm.setData('password', e.target.value)}
                                    placeholder={t('sessions.enter_password', 'Enter your password')}
                                />
                                {revokeForm.errors.password && (
                                    <p className="text-sm text-destructive">{revokeForm.errors.password}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRevokeTarget(null)}>
                                {t('sessions.cancel', 'Cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleRevoke}
                                disabled={revokeForm.processing || !revokeForm.data.password}
                            >
                                {revokeForm.processing
                                    ? t('sessions.revoking', 'Revoking...')
                                    : t('sessions.confirm_revoke', 'Revoke Session')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Revoke All Sessions Dialog */}
                <Dialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {t('sessions.revoke_all_sessions', 'Revoke All Other Sessions')}
                            </DialogTitle>
                            <DialogDescription>
                                {t(
                                    'sessions.revoke_all_description',
                                    'Enter your password to log out all other devices. Only this current session will remain active.',
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="revoke-all-password">{t('sessions.password', 'Password')}</Label>
                                <Input
                                    id="revoke-all-password"
                                    type="password"
                                    value={revokeAllForm.data.password}
                                    onChange={(e) => revokeAllForm.setData('password', e.target.value)}
                                    placeholder={t('sessions.enter_password', 'Enter your password')}
                                />
                                {revokeAllForm.errors.password && (
                                    <p className="text-sm text-destructive">{revokeAllForm.errors.password}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRevokeAllOpen(false)}>
                                {t('sessions.cancel', 'Cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleRevokeAll}
                                disabled={revokeAllForm.processing || !revokeAllForm.data.password}
                            >
                                {revokeAllForm.processing
                                    ? t('sessions.revoking', 'Revoking...')
                                    : t('sessions.confirm_revoke_all', 'Revoke All')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SettingsLayout>
        </AppLayout>
    );
}
