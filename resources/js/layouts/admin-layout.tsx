import { ImpersonationBanner } from '@/components/impersonation-banner';
import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    LayoutDashboard,
    Megaphone,
    ScrollText,
    ToggleLeft,
    Users,
    Mail,
} from 'lucide-react';
import { type PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

const adminNav = [
    { title: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Workspaces', href: '/admin/workspaces', icon: Building2 },
    { title: 'Feature Flags', href: '/admin/feature-flags', icon: ToggleLeft },
    { title: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
    { title: 'Email Templates', href: '/admin/mail-templates', icon: Mail },
    { title: 'Announcements', href: '/admin/announcements', icon: Megaphone },
];

export default function AdminLayout({
    children,
}: PropsWithChildren) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="flex min-h-screen">
            {/* Admin Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
                <div className="flex h-14 items-center gap-2 border-b px-6">
                    <div className="flex size-7 items-center justify-center rounded-md bg-red-600 text-white text-xs font-bold">
                        A
                    </div>
                    <span className="font-semibold text-sm">Admin Panel</span>
                </div>

                <nav className="flex flex-1 flex-col gap-1 p-3">
                    {adminNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                currentPath === item.href
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                            )}
                        >
                            <item.icon className="size-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <div className="border-t p-3">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Back to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                <ImpersonationBanner />

                {/* Mobile admin header */}
                <header className="flex h-14 items-center gap-4 border-b px-4 lg:hidden">
                    <div className="flex size-7 items-center justify-center rounded-md bg-red-600 text-white text-xs font-bold">
                        A
                    </div>
                    <span className="font-semibold text-sm">Admin Panel</span>
                    <nav className="ml-auto flex items-center gap-2">
                        {adminNav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                                    currentPath === item.href
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-accent/50'
                                )}
                            >
                                <item.icon className="size-3.5" />
                                {item.title}
                            </Link>
                        ))}
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent/50 transition-colors"
                        >
                            <ArrowLeft className="size-3.5" />
                            App
                        </Link>
                    </nav>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
