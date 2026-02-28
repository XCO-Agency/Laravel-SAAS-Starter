import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { useToast } from '@/components/ui/toast';
import { useEcho } from '@laravel/echo-react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { currentWorkspace } = usePage<SharedData>().props;
    const { addToast } = useToast();

    useEcho(
        currentWorkspace ? `workspace.${currentWorkspace.id}` : null,
        '.workspace.activity',
        (e: { message: string; type: 'success' | 'error' | 'info' }) => {
            addToast(e.message, e.type);
        },
    );

    const { auth } = usePage<SharedData>().props;

    return (
        <>
            {auth.is_impersonating && (
                <div className="bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-4 sticky top-0 z-50">
                    <span>
                        You are currently impersonating <strong>{auth.user?.name}</strong>.
                    </span>
                    <button
                        onClick={() => router.post('/admin/impersonate/leave')}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors"
                    >
                        Stop Impersonating
                    </button>
                </div>
            )}
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>
        </>
    );
};
