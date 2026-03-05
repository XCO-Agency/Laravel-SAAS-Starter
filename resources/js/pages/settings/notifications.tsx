import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { HelpTooltip } from '@/components/help-tooltip';

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
        channels: {
            email: boolean;
            in_app: boolean;
        };
        categories: {
            marketing: boolean;
            security: boolean;
            team: boolean;
            billing: boolean;
        };
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
                                <Label htmlFor="channel-email">Email notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive notifications in your inbox.
                                </p>
                            </div>
                            <Switch
                                id="channel-email"
                                checked={data.preferences.channels.email}
                                onCheckedChange={(val) =>
                                    setData('preferences', {
                                        ...data.preferences,
                                        channels: { ...data.preferences.channels, email: val },
                                    })
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="channel-in-app">In-app notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive notifications in the app notification center.
                                </p>
                            </div>
                            <Switch
                                id="channel-in-app"
                                checked={data.preferences.channels.in_app}
                                onCheckedChange={(val) =>
                                    setData('preferences', {
                                        ...data.preferences,
                                        channels: { ...data.preferences.channels, in_app: val },
                                    })
                                }
                            />
                        </div>

                        <div className="rounded-lg border border-dashed p-4">
                            <p className="text-sm font-medium">Notification categories</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Category toggles apply to both enabled channels.
                            </p>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="marketing">{t('settings.notifications.marketing', 'Marketing emails')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('settings.notifications.marketing_desc', 'Receive updates about new products, features, and announcements.')}
                                </p>
                            </div>
                            <Switch
                                id="marketing"
                                checked={data.preferences.categories.marketing}
                                onCheckedChange={(val) =>
                                    setData('preferences', {
                                        ...data.preferences,
                                        categories: { ...data.preferences.categories, marketing: val },
                                    })
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="security" className="flex items-center gap-1.5">
                                    {t('settings.notifications.security', 'Security alerts')}
                                    <HelpTooltip content="Critical security alerts cannot be disabled, but you can opt out of regular security digests." />
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('settings.notifications.security_desc', 'Receive alerts about account security activity.')}
                                </p>
                            </div>
                            <Switch
                                id="security"
                                checked={data.preferences.categories.security}
                                onCheckedChange={(val) =>
                                    setData('preferences', {
                                        ...data.preferences,
                                        categories: { ...data.preferences.categories, security: val },
                                    })
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="team">{t('settings.notifications.team', 'Team updates')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('settings.notifications.team_desc', 'Receive updates when team members join or leave your workspace.')}
                                </p>
                            </div>
                            <Switch
                                id="team"
                                checked={data.preferences.categories.team}
                                onCheckedChange={(val) =>
                                    setData('preferences', {
                                        ...data.preferences,
                                        categories: { ...data.preferences.categories, team: val },
                                    })
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="billing" className="flex items-center gap-1.5">
                                    {t('settings.notifications.billing', 'Billing alerts')}
                                    <HelpTooltip content="Invoices and payment receipts will always be sent. This toggles upcoming renewal and budget alerts." />
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('settings.notifications.billing_desc', 'Receive updates about your subscription and billing status.')}
                                </p>
                            </div>
                            <Switch
                                id="billing"
                                checked={data.preferences.categories.billing ?? true}
                                onCheckedChange={(val) =>
                                    setData('preferences', {
                                        ...data.preferences,
                                        categories: { ...data.preferences.categories, billing: val },
                                    })
                                }
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
