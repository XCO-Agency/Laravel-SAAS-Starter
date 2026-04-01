import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/hooks/use-translations';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import {
    type NavItem,
    type SharedData,
    type Workspace,
    type WorkspaceRole,
} from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Building2,
    CreditCard,
    FileUp,
    History,
    Shield,
    TrendingUp,
    Users,
    Webhook,
} from 'lucide-react';
import { type PropsWithChildren, useMemo } from 'react';

interface NavSection {
    title: string;
    items: NavItem[];
}

interface NavItemWithRole extends NavItem {
    allowedRoles?: WorkspaceRole[];
}

const getNavSections = (
    t: (key: string, fallback: string) => string,
    workspace?: Workspace | null,
    userRole?: WorkspaceRole | null,
): NavSection[] => {
    const workspaceItems: NavItemWithRole[] = [
        {
            title: t('navigation.general', 'General'),
            href: '/workspaces/settings',
            icon: Building2,
        },
        {
            title: t('navigation.billing', 'Billing'),
            href: '/billing',
            icon: CreditCard,
            allowedRoles: ['owner', 'admin'],
        },
    ];

    const teamItems: NavItemWithRole[] = [
        {
            title: t('navigation.members', 'Members'),
            href: '/team',
            icon: Users,
        },
        {
            title: t('navigation.csv_import', 'CSV Import'),
            href: '/team/import',
            icon: FileUp,
            allowedRoles: ['owner', 'admin'],
        },
        {
            title: t('navigation.member_activity', 'Activity Report'),
            href: '/team/activity-report',
            icon: BarChart3,
            allowedRoles: ['owner', 'admin'],
        },
    ];

    const analyticsItems: NavItemWithRole[] = [
        {
            title: t('navigation.overview', 'Overview'),
            href: '/workspaces/analytics',
            icon: TrendingUp,
            allowedRoles: ['owner', 'admin'],
        },
        {
            title: t('navigation.api_usage', 'API Usage'),
            href: '/workspaces/api-usage',
            icon: Activity,
            allowedRoles: ['owner', 'admin'],
        },
        {
            title: t('navigation.activity_log', 'Activity Log'),
            href: workspace ? `/workspaces/${workspace.id}/activity` : '#',
            icon: History,
            allowedRoles: ['owner', 'admin'],
        },
    ];

    const securityItems: NavItemWithRole[] = [
        {
            title: t('navigation.security_settings', 'Security Settings'),
            href: '/settings/workspace-security',
            icon: Shield,
            allowedRoles: ['owner', 'admin'],
        },
        {
            title: t('navigation.webhooks', 'Webhooks'),
            href: workspace ? `/workspaces/${workspace.id}/webhooks` : '#',
            icon: Webhook,
            allowedRoles: ['owner', 'admin'],
        },
        {
            title: t('navigation.danger_zone', 'Danger Zone'),
            href: '/settings/workspace-danger-zone',
            icon: AlertTriangle,
            allowedRoles: ['owner'],
        },
    ];

    // Filter items based on role
    const filterItems = (items: NavItemWithRole[]): NavItem[] => {
        return items.filter((item) => {
            if (!item.allowedRoles) return true;
            if (!userRole) return false;
            return item.allowedRoles.includes(userRole);
        });
    };

    const sections: NavSection[] = [
        {
            title: t('navigation.workspace', 'Workspace'),
            items: filterItems(workspaceItems),
        },
    ];

    // Only show team section if there are visible items
    const visibleTeam = filterItems(teamItems);
    if (visibleTeam.length > 0) {
        sections.push({
            title: t('navigation.team', 'Team'),
            items: visibleTeam,
        });
    }

    // Only show analytics if there are visible items
    const visibleAnalytics = filterItems(analyticsItems);
    if (visibleAnalytics.length > 0) {
        sections.push({
            title: t('navigation.analytics', 'Analytics'),
            items: visibleAnalytics,
        });
    }

    // Only show security if there are visible items
    const visibleSecurity = filterItems(securityItems);
    if (visibleSecurity.length > 0) {
        sections.push({
            title: t('navigation.security', 'Security'),
            items: visibleSecurity,
        });
    }

    return sections;
};

interface WorkspaceLayoutProps extends PropsWithChildren {
    title?: string;
    description?: string;
    fullWidth?: boolean;
}

export default function WorkspaceLayout({
    children,
    title,
    description,
    fullWidth = false,
}: WorkspaceLayoutProps) {
    const { t, i18n } = useTranslations();
    const { currentWorkspace } = usePage<SharedData>().props;
    const userRole = currentWorkspace?.role;
    const navSections = useMemo(
        () => getNavSections(t, currentWorkspace, userRole),
        [t, currentWorkspace, userRole],
    );

    const defaultTitle =
        title ?? t('settings.workspace.title', 'Workspace Settings');
    const defaultDescription =
        description ??
        t('settings.workspace.description', 'Manage your workspace settings');

    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
    const isRTL = RTL_LANGUAGES.includes(i18n.language);

    return (
        <div className="px-4 py-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <Heading title={defaultTitle} description={defaultDescription} />

            <div
                className={cn(
                    'settings-layout-container flex flex-col lg:flex-row lg:gap-12',
                    {
                        'lg:flex-row-reverse': isRTL,
                    },
                )}
                data-rtl={isRTL}
            >
                <aside
                    className={cn(
                        'settings-layout-sidebar w-full max-w-xl lg:w-48',
                        {
                            'lg:order-2': isRTL,
                        },
                    )}
                    data-rtl={isRTL}
                >
                    <nav className="flex flex-col space-y-6">
                        {navSections.map((section) => (
                            <div key={section.title}>
                                <h4 className="mb-2 px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    {section.title}
                                </h4>
                                <div className="flex flex-col space-y-1">
                                    {section.items.map((item, index) => (
                                        <Button
                                            key={`${resolveUrl(item.href)}-${index}`}
                                            size="sm"
                                            variant="ghost"
                                            asChild
                                            className={cn(
                                                'w-full justify-start',
                                                {
                                                    'bg-muted': isSameUrl(
                                                        currentPath,
                                                        item.href,
                                                    ),
                                                },
                                            )}
                                        >
                                            <Link href={item.href}>
                                                {item.icon && (
                                                    <item.icon className="h-4 w-4" />
                                                )}
                                                {item.title}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div
                    className={cn('settings-layout-content flex-1', {
                        'md:max-w-2xl': !fullWidth,
                        'lg:order-1': isRTL,
                    })}
                    data-rtl={isRTL}
                >
                    <section
                        className={cn('space-y-12', {
                            'max-w-xl': !fullWidth,
                            'w-full': fullWidth,
                        })}
                    >
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
