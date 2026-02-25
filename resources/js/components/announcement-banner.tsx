import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Announcement {
    id: number;
    title: string;
    body: string;
    type: 'info' | 'warning' | 'success' | 'danger';
    link_text: string | null;
    link_url: string | null;
    is_dismissible: boolean;
}

const STYLES: Record<string, { bg: string; border: string; text: string; icon: typeof Info }> = {
    info: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-200', icon: Info },
    warning: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-200', icon: AlertCircle },
    success: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-200', icon: CheckCircle },
    danger: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-200', icon: XCircle },
};

export function AnnouncementBanner() {
    const { announcement } = usePage<{ announcement?: Announcement }>().props;
    const [dismissed, setDismissed] = useState<number[]>([]);

    if (!announcement || dismissed.includes(announcement.id)) {
        return null;
    }

    const style = STYLES[announcement.type] || STYLES.info;
    const Icon = style.icon;

    return (
        <div className={`relative border-b ${style.bg} ${style.border} ${style.text}`}>
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 text-sm">
                <Icon className="h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                    <span className="font-medium">{announcement.title}</span>
                    {announcement.body && (
                        <span className="ml-1.5 opacity-80">{announcement.body}</span>
                    )}
                    {announcement.link_text && announcement.link_url && (
                        <a
                            href={announcement.link_url}
                            className="ml-2 underline font-medium hover:no-underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {announcement.link_text} →
                        </a>
                    )}
                </div>
                {announcement.is_dismissible && (
                    <button
                        onClick={() => setDismissed([...dismissed, announcement.id])}
                        className="shrink-0 rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
