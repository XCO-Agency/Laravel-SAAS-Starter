import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ActivityEntry {
    id: number;
    description: string;
    event: string | null;
    subject_type: string;
    causer_name: string;
    created_at: string;
}

const EVENT_COLORS: Record<string, string> = {
    created:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function WorkspaceActivityFeed() {
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/workspace-activity-feed', {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((data) => {
                setActivities(data.activities ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Recent Activity
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex animate-pulse items-start gap-3"
                            >
                                <div className="h-4 w-16 rounded bg-muted" />
                                <div className="flex-1 space-y-1">
                                    <div className="h-3 w-3/4 rounded bg-muted" />
                                    <div className="h-3 w-1/2 rounded bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No recent activity.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {activities.map((activity) => (
                            <li
                                key={activity.id}
                                className="flex items-start gap-3 text-sm"
                            >
                                {activity.event && (
                                    <span
                                        className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-medium capitalize ${EVENT_COLORS[activity.event] ?? 'bg-muted text-muted-foreground'}`}
                                    >
                                        {activity.event}
                                    </span>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {activity.causer_name} ·{' '}
                                        {activity.created_at}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
