import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface NavSection {
    title: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        title: 'Workspace',
        items: [
            {
                title: 'General',
                href: '/workspaces/settings',
                icon: null,
            },
            {
                title: 'Team',
                href: '/team',
                icon: null,
            },
            {
                title: 'Billing',
                href: '/billing',
                icon: null,
            },
        ],
    },
    {
        title: 'Account',
        items: [
            {
                title: 'Profile',
                href: edit(),
                icon: null,
            },
            {
                title: 'Password',
                href: editPassword(),
                icon: null,
            },
            {
                title: 'Two-Factor Auth',
                href: show(),
                icon: null,
            },
            {
                title: 'Appearance',
                href: editAppearance(),
                icon: null,
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
    title = 'Settings',
    description = 'Manage your workspace and account settings',
    fullWidth = false,
}: SettingsLayoutProps) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading title={title} description={description} />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
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

                <div className={cn('flex-1', {
                    'md:max-w-2xl': !fullWidth,
                })}>
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
