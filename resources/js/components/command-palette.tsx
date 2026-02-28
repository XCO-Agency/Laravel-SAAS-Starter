import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { router, usePage } from '@inertiajs/react';
import { BadgePercent, Building, CreditCard, Home, Settings, User, Megaphone, History, Loader2 } from 'lucide-react';
import { SharedData } from '@/types';
import http from '@/lib/http';
import { debounce } from 'lodash';

interface SearchResult {
    type: string;
    title: string;
    subtitle: string;
    url: string;
    icon: string;
}

interface GroupedResults {
    [key: string]: SearchResult[];
}

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    User,
    Building,
    Megaphone,
    History,
};

export default function CommandPalette() {
    const { currentWorkspace } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<GroupedResults>({});
    const [loading, setLoading] = useState(false);

    // Global keyboard listener for ⌘K or Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        window.addEventListener('keydown', down);
        return () => window.removeEventListener('keydown', down);
    }, []);

    // Also listen for our custom dispatch event from the header button
    useEffect(() => {
        const handleCustomEvent = () => setOpen(true);
        window.addEventListener('open-command-palette', handleCustomEvent);
        return () => window.removeEventListener('open-command-palette', handleCustomEvent);
    }, []);

    const fetchResults = React.useMemo(
        () =>
            debounce(async (query: string) => {
                if (!query) {
                    setResults({});
                    return;
                }

                setLoading(true);
                try {
                    const { data } = await http.get<GroupedResults>(`/api/search?query=${encodeURIComponent(query)}`);
                    setResults(data);
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setLoading(false);
                }
            }, 300),
        []
    );

    useEffect(() => {
        fetchResults(search);
        return () => fetchResults.cancel();
    }, [search, fetchResults]);

    const runCommand = (command: () => void) => {
        setOpen(false);
        setSearch(''); // Reset search when closing
        setResults({});
        command();
    };

    const navigate = (path: string) => {
        if (path === '#') return;
        runCommand(() => router.get(path));
    };

    if (!open) return null;

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm sm:pt-[10vh]"
            loop
        >
            <div className="w-full max-w-[600px] overflow-hidden rounded-xl bg-background shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                <div className="relative border-b border-border">
                    <Command.Input
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Type a command or search..."
                        className="w-full bg-transparent px-4 py-4 text-base outline-none placeholder:text-muted-foreground focus:ring-0"
                    />
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>

                <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
                    <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                        No results found for "{search}".
                    </Command.Empty>

                    {/* Dynamic Search Results */}
                    {Object.entries(results).map(([type, items]) => (
                        <Command.Group
                            key={type}
                            heading={type}
                            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground p-1 text-foreground"
                        >
                            {items.map((item, index) => {
                                const Icon = IconMap[item.icon] || Settings;
                                return (
                                    <Command.Item
                                        key={`${type}-${index}`}
                                        onSelect={() => navigate(item.url)}
                                        className="flex cursor-pointer select-none items-center gap-3 rounded-md px-2 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background shadow-xs">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.title}</span>
                                            <span className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</span>
                                        </div>
                                    </Command.Item>
                                );
                            })}
                        </Command.Group>
                    ))}

                    {/* Navigation */}
                    <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground p-1 text-foreground">
                        <Command.Item
                            onSelect={() => navigate('/dashboard')}
                            className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <span>Dashboard</span>
                        </Command.Item>
                    </Command.Group>

                    {/* Workspace Context */}
                    {currentWorkspace && (
                        <Command.Group heading={`Workspace Settings: ${currentWorkspace.name}`} className="mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground p-1 text-foreground">
                            <Command.Item
                                onSelect={() => navigate('/team')}
                                className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                            >
                                <span className="flex h-4 w-4 items-center justify-center text-muted-foreground">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.5 7.5C9.29493 7.5 10.75 6.04493 10.75 4.25C10.75 2.45507 9.29493 1 7.5 1C5.70507 1 4.25 2.45507 4.25 4.25C4.25 6.04493 5.70507 7.5 7.5 7.5ZM13.5 13.5H1.5C1.5 10.1863 4.18629 7.5 7.5 7.5C10.8137 7.5 13.5 10.1863 13.5 13.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                    </svg>
                                </span>
                                <span>Team Members</span>
                            </Command.Item>

                            <Command.Item
                                onSelect={() => navigate('/workspaces/settings')}
                                className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                            >
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>Workspace Settings</span>
                            </Command.Item>

                            <Command.Item
                                onSelect={() => navigate('/billing')}
                                className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                            >
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span>Billing & Plans</span>
                            </Command.Item>
                        </Command.Group>
                    )}

                    {/* Account Settings */}
                    <Command.Group heading="Account" className="mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground p-1 text-foreground">
                        <Command.Item
                            onSelect={() => navigate('/settings/profile')}
                            className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                        >
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Profile Settings</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => navigate('/settings/two-factor')}
                            className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                        >
                            <BadgePercent className="h-4 w-4 text-muted-foreground" />
                            <span>Two-Factor Authentication</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => navigate('/settings/api-tokens')}
                            className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                        >
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span>API Tokens</span>
                        </Command.Item>
                    </Command.Group>
                </Command.List>
            </div>
        </Command.Dialog>
    );
}
