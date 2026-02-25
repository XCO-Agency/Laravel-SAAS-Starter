import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/hooks/use-translations';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, Fingerprint, Lock, Paintbrush, ShieldCheck, User } from 'lucide-react';
import { type PropsWithChildren, useMemo } from 'react';
import { type SharedData, type Workspace } from '@/types';

interface NavSection {
    title: string;
    items: NavItem[];
}

const getNavSections = (t: (key: string, fallback: string) => string, workspace?: Workspace | null): NavSection[] => [
    {
        title: t('navigation.general', 'General'),
        items: [
            {
                title: t('navigation.general', 'General'),
                href: '/workspaces/settings',
                icon: null,
            },
            {
                title: t('navigation.team', 'Team'),
                href: '/team',
                icon: null,
            },
            {
                title: t('navigation.billing', 'Billing'),
                href: '/billing',
                icon: null,
            },
            {
                title: t('navigation.security', 'Security'),
                href: '/settings/workspace-security',
                icon: null,
            },
            {
                title: t('navigation.activity', 'Activity'),
                href: workspace ? `/workspaces/${workspace.id}/activity` : '#',
                icon: null,
            },
            {
                title: t('navigation.webhooks', 'Webhooks'),
                href: workspace ? `/workspaces/${workspace.id}/webhooks` : '#',
                icon: null,
            },
        ],
    },
    {
        title: t('navigation.account', 'Account'),
        items: [
            {
                title: t('navigation.profile', 'Profile'),
                href: edit(),
                icon: User,
            },
            {
                title: t('navigation.password', 'Password'),
                href: editPassword(),
                icon: Lock,
            },
            {
                title: t('navigation.two_factor_auth', 'Two-Factor Auth'),
                href: show(),
                icon: ShieldCheck,
            },
            {
                title: t('navigation.appearance', 'Appearance'),
                href: editAppearance(),
                icon: Paintbrush,
            },
            {
                title: t('navigation.notifications', 'Notifications'),
                href: '/settings/notifications',
                icon: Bell,
            },
            {
                title: t('navigation.api_tokens', 'API Tokens'),
                href: '/settings/api-tokens',
                icon: Fingerprint,
            },
        ],
    },
];

interface SettingsLayoutProps extends PropsWithChildren {
    title?: string;
    description?: string;
    fullWidth?: boolean;
}

export default function SettingsLayout({
    children,
    title,
    description,
    fullWidth = false,
}: SettingsLayoutProps) {
    const { t, i18n } = useTranslations();
    const { currentWorkspace } = usePage<SharedData>().props;
    const navSections = useMemo(() => getNavSections(t, currentWorkspace), [t, currentWorkspace]);

    const defaultTitle = title ?? t('settings.title', 'Settings');
    const defaultDescription = description ?? t('settings.description', 'Manage your workspace and account settings');

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    // Detect RTL for layout adjustments
    const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
    const isRTL = RTL_LANGUAGES.includes(i18n.language);

    return (
        <div className="px-4 py-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <Heading title={defaultTitle} description={defaultDescription} />

            <div className={cn('flex flex-col lg:flex-row lg:gap-12 settings-layout-container', {
                'lg:flex-row-reverse': isRTL,
            })} data-rtl={isRTL}>
                <aside className={cn('w-full max-w-xl lg:w-48 settings-layout-sidebar', {
                    'lg:order-2': isRTL,
                })} data-rtl={isRTL}>
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

                <div className={cn('flex-1 settings-layout-content', {
                    'md:max-w-2xl': !fullWidth,
                    'lg:order-1': isRTL,
                })} data-rtl={isRTL}>
                    <section className={cn('space-y-12', {
                        'max-w-xl': !fullWidth,
                        'w-full': fullWidth,
                    })}>
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
