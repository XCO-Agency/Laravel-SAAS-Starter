import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';

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
        <div className="z-50 flex w-full items-center justify-between bg-destructive px-4 py-2 text-sm text-destructive-foreground">
            <div>
                <span className="mr-2 font-semibold">
                    {t('impersonation.active', 'Impersonation Mode Active')}
                </span>
                {t(
                    'impersonation.warning',
                    'You are currently viewing the application as {{name}}.',
                    { name: auth.user.name },
                )}
            </div>
            <Button size="sm" variant="secondary" onClick={leaveImpersonation}>
                {t('impersonation.leave', 'Leave Impersonation')}
            </Button>
        </div>
    );
}
