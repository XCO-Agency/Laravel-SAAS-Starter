import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import { useTranslations } from '@/hooks/use-translations';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: editAppearance().url,
    },
];

export default function Appearance() {
    const { t } = useTranslations();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.appearance.title', 'Appearance settings')} />

            <SettingsLayout
                title={t('settings.appearance.title', 'Appearance settings')}
                description={t('settings.appearance.description', "Update your account's appearance settings")}
                fullWidth
            >
                <div className="space-y-6">
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
