import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RetentionData {
    total_members: number;
    active_last_30_days: number;
    retention_rate: number;
}

export function WorkspaceRetentionWidget() {
    const [data, setData] = useState<RetentionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/workspace-retention-insights', { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((d) => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const rateColor =
        data && data.retention_rate >= 70
            ? 'text-emerald-600 dark:text-emerald-400'
            : data && data.retention_rate >= 40
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Member Retention (30d)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                        <div className="h-2 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                    </div>
                ) : data ? (
                    <div className="space-y-2">
                        <div className={`text-2xl font-bold ${rateColor}`}>
                            {data.retention_rate}%
                        </div>
                        <Progress value={data.retention_rate} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">
                            {data.active_last_30_days} of {data.total_members} members active
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No data available.</p>
                )}
            </CardContent>
        </Card>
    );
}
