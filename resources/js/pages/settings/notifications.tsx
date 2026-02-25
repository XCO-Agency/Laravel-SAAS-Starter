import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Notifications({
    notification_preferences,
}: {
    notification_preferences: {
        marketing: boolean;
        security: boolean;
        team: boolean;
    };
}) {
    const { t } = useTranslations();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.notifications.title', 'Notifications'),
            href: '/settings/notifications',
        },
    ];

    const { data, setData, put, processing, recentlySuccessful } = useForm({
        preferences: notification_preferences,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/notifications', { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.notifications.title', 'Notifications')} />

            <SettingsLayout
                title={t('settings.notifications.title', 'Notifications')}
                description={t('settings.notifications.description', 'Manage how you receive alerts and communications.')}
            >
                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="marketing">{t('settings.notifications.marketing', 'Marketing emails')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('settings.notifications.marketing_desc', 'Receive emails about new products, features, and more.')}
                                </p>
                            </div>
                            <Switch
                                id="marketing"
                                checked={data.preferences.marketing}
                                onCheckedChange={(val) => setData('preferences', { ...data.preferences, marketing: val })}
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="security">{t('settings.notifications.security', 'Security emails')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('settings.notifications.security_desc', 'Receive emails about your account security.')}
                                </p>
                            </div>
                            <Switch
                                id="security"
                                checked={data.preferences.security}
                                onCheckedChange={(val) => setData('preferences', { ...data.preferences, security: val })}
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="team">{t('settings.notifications.team', 'Team updates')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('settings.notifications.team_desc', 'Receive emails when team members join or leave your workspace.')}
                                </p>
                            </div>
                            <Switch
                                id="team"
                                checked={data.preferences.team}
                                onCheckedChange={(val) => setData('preferences', { ...data.preferences, team: val })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>
                            {t('settings.notifications.save', 'Save preferences')}
                        </Button>

                        <Transition
                            show={!!recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">
                                {t('settings.notifications.saved', 'Saved')}
                            </p>
                        </Transition>
                    </div>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
