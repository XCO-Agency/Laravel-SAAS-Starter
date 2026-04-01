import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';

interface HeatmapDay {
    date: string;
    count: number;
    is_future: boolean;
}

interface Props {
    weeks: HeatmapDay[][];
    totalRequests: number;
    maxCount: number;
    dateRange: { start: string; end: string };
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_LABELS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

function getColor(count: number, max: number): string {
    if (count === 0) return 'bg-muted';
    const ratio = count / max;
    if (ratio < 0.15) return 'bg-emerald-100 dark:bg-emerald-900/40';
    if (ratio < 0.35) return 'bg-emerald-300 dark:bg-emerald-700/60';
    if (ratio < 0.65) return 'bg-emerald-500 dark:bg-emerald-500/80';
    if (ratio < 0.85) return 'bg-emerald-600 dark:bg-emerald-400/90';
    return 'bg-emerald-700 dark:bg-emerald-300';
}

function getMonthLabels(
    weeks: HeatmapDay[][],
): { label: string; colIndex: number }[] {
    const seen = new Set<string>();
    const labels: { label: string; colIndex: number }[] = [];
    weeks.forEach((week, i) => {
        const firstDay = week.find((d) => !d.is_future);
        if (!firstDay) return;
        const month = new Date(firstDay.date + 'T00:00:00').getMonth();
        const key = `${month}`;
        if (!seen.has(key)) {
            seen.add(key);
            labels.push({ label: MONTH_LABELS[month], colIndex: i });
        }
    });
    return labels;
}

export default function WorkspaceActivityHeatmap({
    weeks,
    totalRequests,
    maxCount,
    dateRange,
}: Props) {
    const monthLabels = getMonthLabels(weeks);

    return (
        <AdminLayout>
            <Head title="Activity Heatmap" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        API Activity Heatmap
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Daily API request volume across the platform — last 52
                        weeks.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>
                                Total Requests (52w)
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {totalRequests.toLocaleString()}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Peak Day</CardDescription>
                            <CardTitle className="text-2xl">
                                {maxCount.toLocaleString()}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Date Range</CardDescription>
                            <CardTitle className="text-sm font-medium">
                                {dateRange.start} — {dateRange.end}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Request Activity
                        </CardTitle>
                        <CardDescription>
                            Each cell represents one day. Hover for details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full">
                                {/* Month labels */}
                                <div className="mb-1 flex gap-[3px] pl-8">
                                    {weeks.map((_, i) => {
                                        const lbl = monthLabels.find(
                                            (m) => m.colIndex === i,
                                        );
                                        return (
                                            <div
                                                key={i}
                                                className="w-[13px] flex-shrink-0 text-[10px] text-muted-foreground"
                                            >
                                                {lbl ? lbl.label : ''}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Grid */}
                                <div className="flex gap-[3px]">
                                    {/* Day labels */}
                                    <div className="flex flex-col gap-[3px] pr-1">
                                        {DAY_LABELS.map((d, i) => (
                                            <div
                                                key={d}
                                                className={`h-[13px] text-right text-[10px] leading-[13px] text-muted-foreground ${i % 2 === 1 ? '' : 'invisible'}`}
                                            >
                                                {d}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Weeks */}
                                    {weeks.map((week, wi) => (
                                        <div
                                            key={wi}
                                            className="flex flex-col gap-[3px]"
                                        >
                                            {week.map((day) => (
                                                <div
                                                    key={day.date}
                                                    title={
                                                        day.is_future
                                                            ? ''
                                                            : `${day.date}: ${day.count} requests`
                                                    }
                                                    className={`h-[13px] w-[13px] rounded-[2px] transition-opacity ${
                                                        day.is_future
                                                            ? 'opacity-0'
                                                            : getColor(
                                                                  day.count,
                                                                  maxCount,
                                                              )
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="mt-3 flex items-center gap-1.5 pl-8">
                                    <span className="text-[11px] text-muted-foreground">
                                        Less
                                    </span>
                                    {[0, 0.1, 0.3, 0.6, 1].map((r, i) => (
                                        <div
                                            key={i}
                                            className={`h-[13px] w-[13px] rounded-[2px] ${getColor(Math.round(r * maxCount), maxCount)}`}
                                        />
                                    ))}
                                    <span className="text-[11px] text-muted-foreground">
                                        More
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
