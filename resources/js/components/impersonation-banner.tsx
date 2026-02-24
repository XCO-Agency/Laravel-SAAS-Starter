import { usePage, router } from '@inertiajs/react';
import { SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';

export function ImpersonationBanner() {
    const { t } = useTranslations();
    const { auth } = usePage<SharedData>().props;

    if (!auth.is_impersonating) {
        return null;
    }

    const leaveImpersonation = () => {
        router.post('/admin/impersonate/leave');
    };

    return (
        <div className="w-full bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between text-sm z-50">
            <div>
                <span className="font-semibold mr-2">{t('impersonation.active', 'Impersonation Mode Active')}</span>
                {t('impersonation.warning', "You are currently viewing the application as {{name}}.", { name: auth.user.name })}
            </div>
            <Button size="sm" variant="secondary" onClick={leaveImpersonation}>
                {t('impersonation.leave', 'Leave Impersonation')}
            </Button>
        </div>
    );
}
