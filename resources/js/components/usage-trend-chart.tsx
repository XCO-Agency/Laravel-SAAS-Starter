import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertCircle, Minus, TrendingDown, TrendingUp } from 'lucide-react';

interface UsageTrend {
    label: string;
    current: number;
    previous: number;
    limit: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
}

interface UsageTrendChartProps {
    trends: UsageTrend[];
}

export default function UsageTrendChart({ trends }: UsageTrendChartProps) {
    const getTrendIcon = (trend: string, change: number) => {
        if (trend === 'up') {
            return (
                <TrendingUp
                    className={cn(
                        'h-4 w-4',
                        change > 20 ? 'text-destructive' : 'text-orange-500',
                    )}
                />
            );
        }
        if (trend === 'down') {
            return <TrendingDown className="h-4 w-4 text-green-500" />;
        }
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    };

    const getChangePercentage = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Usage Trends
                    <span className="text-xs font-normal text-muted-foreground">
                        (vs last 30 days)
                    </span>
                </CardTitle>
                <CardDescription>
                    Track how your workspace usage has changed over time
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {trends.map((trend) => {
                        const change = getChangePercentage(
                            trend.current,
                            trend.previous,
                        );
                        const isOverLimit =
                            trend.limit !== -1 && trend.current > trend.limit;

                        return (
                            <div key={trend.label} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {trend.label}
                                        </span>
                                        {isOverLimit && (
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            {getTrendIcon(trend.trend, change)}
                                            <span
                                                className={cn(
                                                    'text-sm font-medium',
                                                    change > 20
                                                        ? 'text-destructive'
                                                        : change > 0
                                                          ? 'text-orange-500'
                                                          : change < 0
                                                            ? 'text-green-500'
                                                            : 'text-muted-foreground',
                                                )}
                                            >
                                                {change > 0 ? '+' : ''}
                                                {change}%
                                            </span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {trend.current} /{' '}
                                            {trend.limit === -1
                                                ? '∞'
                                                : trend.limit}
                                        </span>
                                    </div>
                                </div>

                                <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all duration-500',
                                            isOverLimit
                                                ? 'bg-destructive'
                                                : trend.percentage > 80
                                                  ? 'bg-orange-500'
                                                  : 'bg-primary',
                                        )}
                                        style={{
                                            width: `${Math.min(trend.percentage, 100)}%`,
                                        }}
                                    />
                                    {trend.limit !== -1 && (
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/30"
                                            style={{ left: '100%' }}
                                        />
                                    )}
                                </div>

                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Previous: {trend.previous}</span>
                                    {isOverLimit && (
                                        <span className="font-medium text-destructive">
                                            {trend.current - trend.limit} over
                                            limit
                                        </span>
                                    )}
                                    {trend.limit !== -1 &&
                                        trend.percentage > 80 &&
                                        !isOverLimit && (
                                            <span className="text-orange-500">
                                                {trend.limit - trend.current}{' '}
                                                remaining
                                            </span>
                                        )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
