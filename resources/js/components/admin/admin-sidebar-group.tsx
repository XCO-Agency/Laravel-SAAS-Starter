import { useFeature } from '@/contexts/feature-context';
import { cn } from '@/lib/utils';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
    feature?: string;
}

interface AdminSidebarGroupProps {
    title: string;
    icon: LucideIcon;
    items: NavItem[];
    currentPath: string;
    defaultExpanded?: boolean;
    storageKey: string;
}

export function AdminSidebarGroup({
    title,
    icon: GroupIcon,
    items,
    currentPath,
    defaultExpanded = true,
    storageKey,
}: AdminSidebarGroupProps) {
    // Check localStorage for saved state, default to expanded
    const [isExpanded, setIsExpanded] = useState(() => {
        if (typeof window === 'undefined') return defaultExpanded;
        const saved = localStorage.getItem(`admin-sidebar-${storageKey}`);
        return saved ? saved === 'true' : defaultExpanded;
    });

    const isFeatureEnabled = useFeature;

    // Auto-expand if current route is in this group
    useEffect(() => {
        const isActiveInGroup = items.some(
            (item) =>
                currentPath === item.href ||
                currentPath.startsWith(item.href + '/'),
        );
        if (isActiveInGroup && !isExpanded) {
            setIsExpanded(true);
        }
    }, [currentPath, items, isExpanded]);

    // Save state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                `admin-sidebar-${storageKey}`,
                String(isExpanded),
            );
        }
    }, [isExpanded, storageKey]);

    // Filter items by feature flag
    const visibleItems = items.filter((item) => {
        if (!item.feature) return true;
        return isFeatureEnabled(item.feature);
    });

    // Don't render if no visible items
    if (visibleItems.length === 0) return null;

    const isGroupActive = visibleItems.some(
        (item) =>
            currentPath === item.href ||
            currentPath.startsWith(item.href + '/'),
    );

    return (
        <div className="mb-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isGroupActive
                        ? 'bg-sidebar-accent/50 text-sidebar-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground',
                )}
            >
                <div className="flex items-center gap-3">
                    <GroupIcon className="size-4" />
                    <span>{title}</span>
                </div>
                <ChevronDown
                    className={cn(
                        'size-4 transition-transform duration-200',
                        isExpanded ? 'rotate-0' : '-rotate-90',
                    )}
                />
            </button>

            <div
                className={cn(
                    'overflow-hidden transition-all duration-200 ease-in-out',
                    isExpanded
                        ? 'mt-1 max-h-96 opacity-100'
                        : 'max-h-0 opacity-0',
                )}
            >
                <div className="ml-3 flex flex-col gap-0.5 border-l border-sidebar-border/50 pl-4">
                    {visibleItems.map((item) => {
                        const isActive =
                            currentPath === item.href ||
                            currentPath.startsWith(item.href + '/');
                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors',
                                    isActive
                                        ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                                )}
                            >
                                {item.icon && (
                                    <item.icon className="size-3.5" />
                                )}
                                <span>{item.title}</span>
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
