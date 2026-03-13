import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ChangelogEntry {
    id: number;
    version: string | null;
    title: string;
    body: string;
    type: string | null;
    published_at: string | null;
}

const TYPE_COLORS: Record<string, string> = {
    feature: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    improvement: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    fix: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    security: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function ChangelogWidget() {
    const [open, setOpen] = useState(false);
    const [entries, setEntries] = useState<ChangelogEntry[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch('/changelog-widget', { headers: { Accept: 'application/json' } })
            .then(r => r.json())
            .then(data => {
                setEntries(data.entries ?? []);
                setHasUnread(data.has_unread ?? false);
                setLoaded(true);
            })
            .catch(() => setLoaded(true));
    }, []);

    const handleOpen = (value: boolean) => {
        setOpen(value);
        if (value && hasUnread) {
            const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            fetch('/changelog-widget/mark-read', {
                method: 'POST',
                headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf },
            }).then(() => setHasUnread(false));
        }
    };

    if (!loaded) {
        return null;
    }

    return (
        <Popover open={open} onOpenChange={handleOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8">
                    <Bell className="h-4 w-4" />
                    {hasUnread && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                    )}
                    <span className="sr-only">What's new</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="border-b px-4 py-3">
                    <h3 className="font-semibold text-sm">What's New</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {entries.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-center text-muted-foreground">
                            No updates yet.
                        </p>
                    ) : (
                        entries.map(entry => (
                            <div key={entry.id} className="border-b px-4 py-3 last:border-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {entry.type && (
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[entry.type] ?? 'bg-muted text-muted-foreground'}`}>
                                            {entry.type}
                                        </span>
                                    )}
                                    {entry.version && (
                                        <span className="text-[10px] text-muted-foreground">
                                            v{entry.version}
                                        </span>
                                    )}
                                    {entry.published_at && (
                                        <span className="ml-auto text-[10px] text-muted-foreground">
                                            {new Date(entry.published_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium">{entry.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{entry.body}</p>
                            </div>
                        ))
                    )}
                </div>
                <div className="border-t px-4 py-2">
                    <a href="/changelog" className="text-xs text-primary hover:underline">
                        View full changelog →
                    </a>
                </div>
            </PopoverContent>
        </Popover>
    );
}
