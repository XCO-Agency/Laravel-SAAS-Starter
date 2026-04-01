import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import { useTranslations } from '@/hooks/use-translations';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import ProfileLayout from '@/layouts/settings/profile-layout';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { t } = useTranslations();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.appearance.title', 'Appearance settings'),
            href: editAppearance().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={t('settings.appearance.title', 'Appearance settings')}
            />

            <ProfileLayout
                title={t('settings.appearance.title', 'Appearance settings')}
                description={t(
                    'settings.appearance.description',
                    "Update your account's appearance settings",
                )}
                fullWidth
            >
                <div className="space-y-6">
                    <AppearanceTabs />
                </div>
            </ProfileLayout>
        </AppLayout>
    );
}
