import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { useToast } from '@/components/ui/toast';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { currentWorkspace } = usePage<SharedData>().props;
    const { addToast } = useToast();

    useEffect(() => {
        if (!currentWorkspace) {
            return;
        }

        const channel = window.Echo.private(`workspace.${currentWorkspace.id}`)
            .listen('.workspace.activity', (e: { message: string, type: 'success' | 'error' | 'info' }) => {
                addToast(e.message, e.type);
            });

        return () => {
            channel.stopListening('.workspace.activity');
        };
    }, [currentWorkspace, addToast]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
};
