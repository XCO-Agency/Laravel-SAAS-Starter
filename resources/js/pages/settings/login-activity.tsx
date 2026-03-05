import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import { useTranslations } from '@/hooks/use-translations';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { CheckCircle, Clock, Globe, Monitor, XCircle } from 'lucide-react';

interface LoginActivityItem {
    id: number;
    ip_address: string | null;
    device: string;
    login_at: string;
    is_successful: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Login History',
        href: '/settings/login-history',
    },
];

export default function LoginActivity({ activities }: { activities: LoginActivityItem[] }) {
    const { t } = useTranslations();

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) {
            return t('login_history.just_now', 'Just now');
        }
        if (diffHours < 24) {
            return `${diffHours} ${diffHours === 1 ? t('login_history.hour_ago', 'hour ago') : t('login_history.hours_ago', 'hours ago')}`;
        }
        if (diffDays < 7) {
            return `${diffDays} ${diffDays === 1 ? t('login_history.day_ago', 'day ago') : t('login_history.days_ago', 'days ago')}`;
        }
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('login_history.title', 'Login History')} />

            <SettingsLayout
                title={t('login_history.title', 'Login History')}
                description={t('login_history.description', 'Review recent sign-in activity on your account.')}
                fullWidth
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            {t('login_history.recent_activity', 'Recent Sign-in Activity')}
                        </CardTitle>
                        <CardDescription>
                            {t(
                                'login_history.recent_activity_description',
                                'Your last 50 sign-in attempts are shown below.',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activities.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                {t('login_history.no_activity', 'No sign-in activity recorded yet.')}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                <Monitor className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {activity.device}
                                                    </span>
                                                    {activity.is_successful ? (
                                                        <Badge variant="default" className="gap-1 text-xs">
                                                            <CheckCircle className="h-3 w-3" />
                                                            {t('login_history.success', 'Success')}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="gap-1 text-xs">
                                                            <XCircle className="h-3 w-3" />
                                                            {t('login_history.failed', 'Failed')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    {activity.ip_address && (
                                                        <span className="flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            {activity.ip_address}
                                                        </span>
                                                    )}
                                                    <span>{formatDate(activity.login_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </SettingsLayout>
        </AppLayout>
    );
}
