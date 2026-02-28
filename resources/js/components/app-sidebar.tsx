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
import { type NavItem, type SharedData } from '@/types';
import { BarChart3, BookOpen, LayoutGrid, ShieldAlert } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

const getMainNavItems = (t: (key: string, fallback: string) => string, isSuperadmin: boolean = false): NavItem[] => {
    const items = [
        {
            title: t('navigation.dashboard', 'Dashboard'),
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: t('navigation.usage', 'Usage'),
            href: '/usage',
            icon: BarChart3,
        },
    ];

    if (isSuperadmin) {
        items.push({
            title: t('navigation.admin', 'Superadmin Panel'),
            href: '/admin/dashboard',
            icon: ShieldAlert,
        });
    }

    return items;
};

const getFooterNavItems = (t: (key: string, fallback: string) => string): NavItem[] => [
    {
        title: t('navigation.help_center', 'Help Center'),
        href: '/help',
        icon: BookOpen,
        external: false,
    },
];

export function AppSidebar() {
    const { t, i18n } = useTranslations();
    const { auth } = usePage<SharedData>().props;
    const isSuperadmin = auth.user.is_superadmin === true;

    const mainNavItems = useMemo(() => getMainNavItems(t, isSuperadmin), [t, isSuperadmin]);
    const footerNavItems = useMemo(() => getFooterNavItems(t), [t]);

    // Set sidebar to right side for RTL languages
    const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
    const isRTL = RTL_LANGUAGES.includes(i18n.language);
    const sidebarSide = isRTL ? 'right' : 'left';

    return (
        <Sidebar collapsible="icon" variant="inset" side={sidebarSide}>
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
