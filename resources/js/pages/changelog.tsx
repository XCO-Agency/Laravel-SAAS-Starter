import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Sparkles,
    Wrench,
    Zap,
} from 'lucide-react';

interface ChangelogEntry {
    id: number;
    version: string;
    title: string;
    body: string;
    type: string;
    published_at: string;
}

interface Props {
    entries: ChangelogEntry[];
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Sparkles; color: string; dot: string }> = {
    feature: { label: 'Feature', icon: Sparkles, color: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
    improvement: { label: 'Improvement', icon: Zap, color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    fix: { label: 'Fix', icon: Wrench, color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
};

export default function Changelog({ entries }: Props) {
    return (
        <>
            <Head title="Changelog" />
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Home
                        </Link>
                        <div className="h-4 w-px bg-border" />
                        <h1 className="text-sm font-semibold">Changelog</h1>
                    </div>
                </header>

                {/* Content */}
                <main className="mx-auto max-w-3xl px-4 py-12">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Changelog</h2>
                        <p className="text-muted-foreground mt-2">
                            New updates and improvements to our platform.
                        </p>
                    </div>

                    {entries.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <p className="text-lg font-medium">No updates yet</p>
                            <p className="text-sm mt-1">Check back soon for the latest improvements.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

                            <div className="space-y-10">
                                {entries.map((entry) => {
                                    const config = TYPE_CONFIG[entry.type] || TYPE_CONFIG.improvement;

                                    return (
                                        <article key={entry.id} className="relative pl-8">
                                            {/* Timeline dot */}
                                            <div className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-background ${config.dot}`} />

                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    v{entry.version}
                                                </Badge>
                                                <Badge variant="secondary" className={`text-xs ${config.color}`}>
                                                    {config.label}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(entry.published_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-semibold tracking-tight">
                                                {entry.title}
                                            </h3>

                                            <div className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                                {entry.body}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
