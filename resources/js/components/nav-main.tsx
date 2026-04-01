import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslations } from '@/hooks/use-translations';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

// Map href patterns to tour data attributes
const getTourAttribute = (href: string): string | undefined => {
    if (href === '/usage') return 'nav-usage';
    if (href === '/dashboard') return 'nav-dashboard';
    return undefined;
};

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { t } = useTranslations();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>
                {t('navigation.platform', 'Platform')}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const href = typeof item.href === 'string' ? item.href : '';
                    const tourAttr = getTourAttribute(href);
                    return (
                        <SidebarMenuItem
                            key={item.title}
                            {...(tourAttr ? { 'data-tour': tourAttr } : {})}
                        >
                            <SidebarMenuButton
                                asChild
                                isActive={page.url.startsWith(resolveUrl(href))}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
