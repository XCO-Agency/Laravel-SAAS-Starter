import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import {
    FileText,
    Loader2,
    Megaphone,
    MessageSquare,
    Search,
    Users,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface SearchResult {
    id: number;
    type: 'activity' | 'comment' | 'announcement' | 'member';
    title: string;
    description: string;
    causer: string;
    created_at: string | null;
    url: string | null;
}

interface WorkspaceSearchProps {
    workspaceId: number;
    className?: string;
}

const TYPE_ICONS = {
    activity: FileText,
    comment: MessageSquare,
    announcement: Megaphone,
    member: Users,
};

const TYPE_LABELS = {
    activity: 'Activity',
    comment: 'Comment',
    announcement: 'Announcement',
    member: 'Member',
};

export function WorkspaceSearch({
    workspaceId,
    className,
}: WorkspaceSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [facets, setFacets] = useState<Record<string, number>>({});
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const performSearch = useCallback(
        async (searchQuery: string, type: string | null = null) => {
            if (searchQuery.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const params = new URLSearchParams({ q: searchQuery });
                if (type) params.append('type', type);

                const response = await fetch(
                    `/workspaces/${workspaceId}/search?${params}`,
                );
                const data = await response.json();

                setResults(data.data || []);
                setFacets(data.facets || {});
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        },
        [workspaceId],
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(query, selectedType);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, selectedType, performSearch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleResultClick = (result: SearchResult) => {
        setOpen(false);
        if (result.url) {
            router.visit(result.url);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className={cn(
                    'relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none hover:bg-muted sm:pr-12 md:w-40 lg:w-64',
                    className,
                )}
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                Search...
                <kbd className="pointer-events-none absolute top-1.5 right-1.5 hidden h-6 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 select-none sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput
                        placeholder="Search workspace..."
                        value={query}
                        onValueChange={setQuery}
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {loading && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                    {query && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => setQuery('')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                <div className="border-b px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(facets).map(([type, count]) => (
                            <Badge
                                key={type}
                                variant={
                                    selectedType === type
                                        ? 'default'
                                        : 'secondary'
                                }
                                className="cursor-pointer"
                                onClick={() =>
                                    setSelectedType(
                                        selectedType === type ? null : type,
                                    )
                                }
                            >
                                {TYPE_LABELS[type as keyof typeof TYPE_LABELS]}{' '}
                                ({count})
                            </Badge>
                        ))}
                    </div>
                </div>

                <CommandList className="max-h-[400px] overflow-y-auto">
                    {results.length === 0 && query.length >= 2 && !loading && (
                        <CommandEmpty>No results found.</CommandEmpty>
                    )}

                    {results.length > 0 && (
                        <CommandGroup heading="Results">
                            {results.map((result) => {
                                const Icon = TYPE_ICONS[result.type];
                                return (
                                    <CommandItem
                                        key={`${result.type}-${result.id}`}
                                        onSelect={() =>
                                            handleResultClick(result)
                                        }
                                        className="flex items-start gap-3 py-3"
                                    >
                                        <div className="mt-0.5">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {result.title}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {TYPE_LABELS[result.type]}
                                                </Badge>
                                            </div>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {result.description}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                by {result.causer}
                                                {result.created_at && (
                                                    <>
                                                        {' · '}
                                                        {new Date(
                                                            result.created_at,
                                                        ).toLocaleDateString()}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
