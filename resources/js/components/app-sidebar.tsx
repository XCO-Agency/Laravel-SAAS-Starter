import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import { useTranslations } from '@/hooks/use-translations';
import { type NavItem } from '@/types';
import { BookOpen, LayoutGrid } from 'lucide-react';
import { useMemo } from 'react';

const getMainNavItems = (t: (key: string, fallback: string) => string): NavItem[] => [
    {
        title: t('navigation.dashboard', 'Dashboard'),
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

const getFooterNavItems = (t: (key: string, fallback: string) => string): NavItem[] => [
    {
        title: t('navigation.help_center', 'Help Center'),
        href: '/help',
        icon: BookOpen,
        external: false,
    },
];

export function AppSidebar() {
    const { t } = useTranslations();
    const mainNavItems = useMemo(() => getMainNavItems(t), [t]);
    const footerNavItems = useMemo(() => getFooterNavItems(t), [t]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <WorkspaceSwitcher />
            </SidebarHeader>
            <SidebarSeparator />

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
