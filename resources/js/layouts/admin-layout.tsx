import { ImpersonationBanner } from '@/components/impersonation-banner';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    Bell,
    Building2,
    Clock,
    Compass,
    DollarSign,
    Globe,
    Grid3X3,
    KeyRound,
    LayoutDashboard,
    ListChecks,
    Mail,
    Megaphone,
    MessageSquare,
    Power,
    ScrollText,
    Search,
    ShieldCheck,
    Terminal,
    Ticket,
    ToggleLeft,
    Users,
} from 'lucide-react';
import { type PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';

const adminNav = [
    { title: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'User Analytics', href: '/admin/user-analytics', icon: BarChart3 },
    { title: 'Revenue', href: '/admin/revenue-analytics', icon: DollarSign },
    { title: 'Notifications', href: '/admin/notification-analytics', icon: Bell },
    { title: 'Onboarding', href: '/admin/onboarding-insights', icon: Compass },
    { title: 'Cohort Analysis', href: '/admin/cohort-analysis', icon: Grid3X3 },
    { title: 'Workspaces', href: '/admin/workspaces', icon: Building2 },
    { title: 'Feature Flags', href: '/admin/feature-flags', icon: ToggleLeft },
    { title: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
    { title: 'Impersonation Logs', href: '/admin/impersonation-logs', icon: ScrollText },
    { title: 'System Logs', href: '/admin/logs', icon: Terminal },
    { title: 'Email Templates', href: '/admin/mail-templates', icon: Mail },
    { title: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { title: 'Broadcasts', href: '/admin/broadcasts', icon: Megaphone },
    { title: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
    { title: 'Data Retention', href: '/admin/retention', icon: ShieldCheck },
    { title: 'System Health', href: '/admin/system-health', icon: Activity },
    { title: 'Changelog', href: '/admin/changelog', icon: ListChecks },
    { title: 'Status Page', href: '/admin/status', icon: Activity },
    { title: 'Scheduled Tasks', href: '/admin/scheduled-tasks', icon: Clock },
    { title: 'SEO', href: '/admin/seo', icon: Globe },
    { title: 'Translations', href: '/admin/translations', icon: Globe },
    { title: 'Support Tickets', href: '/admin/tickets', icon: Ticket },
    { title: 'Permissions', href: '/admin/permission-presets', icon: KeyRound },
    { title: 'System Alerts', href: '/admin/system-notifications', icon: AlertTriangle },
    { title: 'Maintenance', href: '/admin/maintenance', icon: Power },
];

interface SearchResult {
    id: number;
    name?: string;
    email?: string;
    slug?: string;
    workspace_name?: string;
    stripe_status?: string;
    url: string;
}

interface SearchResults {
    users: SearchResult[];
    workspaces: SearchResult[];
    subscriptions: SearchResult[];
}

function AdminSearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchResults = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults(null);
            return;
        }
        const res = await fetch(`/admin/search?q=${encodeURIComponent(q)}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        });
        if (res.ok) {
            setResults(await res.json());
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchResults(query), 300);
        return () => clearTimeout(timer);
    }, [query, fetchResults]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const hasResults = results && (
        results.users.length > 0 || results.workspaces.length > 0 || results.subscriptions.length > 0
    );

    const navigate = (url: string) => {
        setOpen(false);
        setQuery('');
        setResults(null);
        router.visit(url);
    };

    return (
        <div ref={containerRef} className="relative px-3 py-2">
            <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/30 px-2.5 py-1.5">
                <Search className="size-3.5 shrink-0 text-sidebar-foreground/50" />
                <input
                    className="w-full bg-transparent text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/50 outline-none"
                    placeholder="Search users, workspaces…"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                />
            </div>

            {open && query.length >= 2 && (
                <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-md border border-border bg-popover shadow-lg">
                    {!hasResults ? (
                        <p className="px-3 py-2 text-xs text-muted-foreground">No results found.</p>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            {results.users.length > 0 && (
                                <div>
                                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Users</p>
                                    {results.users.map((u) => (
                                        <button
                                            key={u.id}
                                            onClick={() => navigate(u.url)}
                                            className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-accent"
                                        >
                                            <span className="font-medium">{u.name}</span>
                                            <span className="text-xs text-muted-foreground">{u.email}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {results.workspaces.length > 0 && (
                                <div>
                                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspaces</p>
                                    {results.workspaces.map((w) => (
                                        <button
                                            key={w.id}
                                            onClick={() => navigate(w.url)}
                                            className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-accent"
                                        >
                                            <span className="font-medium">{w.name}</span>
                                            <span className="text-xs text-muted-foreground">{w.slug}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {results.subscriptions.length > 0 && (
                                <div>
                                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Subscriptions</p>
                                    {results.subscriptions.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => navigate(s.url)}
                                            className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-accent"
                                        >
                                            <span className="font-medium">{s.workspace_name}</span>
                                            <span className="text-xs text-muted-foreground">{s.stripe_status}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

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

                <AdminSearchBar />

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
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
