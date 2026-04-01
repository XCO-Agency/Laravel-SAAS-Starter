import CookieConsentBanner from '@/components/cookie-consent-banner';
import { useToast } from '@/components/ui/toast';
import { FeatureProvider } from '@/contexts/feature-context';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { currentWorkspace } = usePage<SharedData>().props;
    const { addToast } = useToast();

    useEcho(
        currentWorkspace
            ? `workspace.${currentWorkspace.id}`
            : 'null-workspace',
        '.workspace.activity',
        (e: { message: string; type: 'success' | 'error' | 'info' }) => {
            addToast(e.message, e.type);
        },
    );

    const { auth } = usePage<SharedData>().props;

    return (
        <>
            {auth.is_impersonating && (
                <div className="sticky top-0 z-50 flex items-center justify-center gap-4 bg-destructive px-4 py-2 text-center text-sm font-medium text-destructive-foreground">
                    <span>
                        You are currently impersonating{' '}
                        <strong>{auth.user?.name}</strong>.
                    </span>
                    <button
                        onClick={() => router.post('/admin/impersonate/leave')}
                        className="rounded-md bg-white/20 px-3 py-1 transition-colors hover:bg-white/30"
                    >
                        Stop Impersonating
                    </button>
                </div>
            )}
            <FeatureProvider>
                <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                    {children}
                </AppLayoutTemplate>
            </FeatureProvider>
            <CookieConsentBanner />
        </>
    );
};
