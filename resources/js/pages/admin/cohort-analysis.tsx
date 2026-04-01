import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { Grid3X3 } from 'lucide-react';

interface Cohort {
    month: string;
    size: number;
    retention: (number | null)[];
}

interface CohortAnalysisProps {
    cohorts: Cohort[];
}

function retentionColor(value: number | null): string {
    if (value === null) {
        return 'bg-muted text-muted-foreground';
    }
    if (value >= 70) {
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
    }
    if (value >= 40) {
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    }
    return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300';
}

export default function CohortAnalysis({ cohorts }: CohortAnalysisProps) {
    const maxMonths = Math.max(...cohorts.map((c) => c.retention.length), 0);

    // Column headers: Month 0, Month 1, Month 2, Month 3
    const columnHeaders = Array.from({ length: maxMonths }, (_, i) =>
        i === 0 ? 'Month 0' : `Month ${i}`,
    );

    // Average retention per column (excluding nulls and month 0)
    const averages = columnHeaders.map((_, colIdx) => {
        const values = cohorts
            .map((c) => c.retention[colIdx])
            .filter((v): v is number => v !== null && v !== undefined);
        if (values.length === 0) {
            return null;
        }
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    });

    return (
        <AdminLayout>
            <Head title="Cohort Retention Analysis" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl border border-sidebar-border/70 p-4 md:p-6 lg:p-8">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Grid3X3 className="h-6 w-6" />
                        Cohort Retention Analysis
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Percentage of users from each signup month who returned
                        and logged in in subsequent months.
                    </p>
                </div>

                {cohorts.length === 0 ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
                            No cohort data available yet.
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Retention by Signup Cohort</CardTitle>
                            <CardDescription>
                                Last 6 months · green ≥ 70% · amber ≥ 40% · red
                                &lt; 40% · — future period
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="w-full min-w-[540px] text-sm">
                                <thead>
                                    <tr>
                                        <th className="py-2 pr-4 text-left font-semibold text-muted-foreground">
                                            Cohort
                                        </th>
                                        <th className="py-2 pr-4 text-right font-semibold text-muted-foreground">
                                            Users
                                        </th>
                                        {columnHeaders.map((header) => (
                                            <th
                                                key={header}
                                                className="px-2 py-2 text-center font-semibold text-muted-foreground"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {cohorts.map((cohort) => (
                                        <tr key={cohort.month}>
                                            <td className="py-2 pr-4 font-medium">
                                                {cohort.month}
                                            </td>
                                            <td className="py-2 pr-4 text-right text-muted-foreground tabular-nums">
                                                {cohort.size.toLocaleString()}
                                            </td>
                                            {columnHeaders.map((_, colIdx) => {
                                                const value =
                                                    cohort.retention[colIdx] ??
                                                    null;
                                                return (
                                                    <td
                                                        key={colIdx}
                                                        className="px-2 py-2 text-center"
                                                    >
                                                        {value === null ? (
                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className={`inline-block min-w-[3.5rem] rounded-md px-2 py-0.5 font-semibold tabular-nums ${retentionColor(value)}`}
                                                            >
                                                                {value}%
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2">
                                        <td className="py-2 pr-4 font-semibold text-muted-foreground">
                                            Average
                                        </td>
                                        <td />
                                        {averages.map((avg, colIdx) => (
                                            <td
                                                key={colIdx}
                                                className="px-2 py-2 text-center"
                                            >
                                                {avg === null ? (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={`inline-block min-w-[3.5rem] rounded-md px-2 py-0.5 font-semibold tabular-nums ${retentionColor(avg)}`}
                                                    >
                                                        {avg}%
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                </tfoot>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block size-3 rounded-sm bg-emerald-100 dark:bg-emerald-950/60" />
                        ≥ 70% — excellent
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block size-3 rounded-sm bg-amber-100 dark:bg-amber-950/60" />
                        40–69% — moderate
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block size-3 rounded-sm bg-red-100 dark:bg-red-950/60" />
                        &lt; 40% — needs attention
                    </span>
                </div>
            </div>
        </AdminLayout>
    );
}
