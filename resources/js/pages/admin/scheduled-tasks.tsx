import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { Clock, Layers, Terminal } from 'lucide-react';

interface ScheduledTask {
    command: string;
    expression: string;
    human_readable: string;
    timezone: string;
    without_overlapping: boolean;
    run_in_background: boolean;
    next_due: string | null;
    description: string;
}

interface Props {
    tasks: ScheduledTask[];
}

export default function ScheduledTasks({ tasks }: Props) {
    return (
        <AdminLayout>
            <Head title="Scheduled Tasks" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Clock className="h-6 w-6" />
                        Scheduled Tasks
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Monitor all scheduled tasks registered in the
                        application.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Tasks
                            </CardTitle>
                            <Terminal className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {tasks.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                No Overlap
                            </CardTitle>
                            <Layers className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {
                                    tasks.filter((t) => t.without_overlapping)
                                        .length
                                }
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Background
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {
                                    tasks.filter((t) => t.run_in_background)
                                        .length
                                }
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tasks Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registered Tasks</CardTitle>
                        <CardDescription>
                            {tasks.length === 0
                                ? 'No scheduled tasks are registered in this application.'
                                : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} registered in the scheduler.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Clock className="mb-3 h-10 w-10 opacity-30" />
                                <p className="text-sm">
                                    No scheduled tasks found.
                                </p>
                                <p className="mt-1 text-xs">
                                    Define tasks in{' '}
                                    <code className="rounded bg-muted px-1">
                                        routes/console.php
                                    </code>{' '}
                                    or{' '}
                                    <code className="rounded bg-muted px-1">
                                        app/Console/Kernel.php
                                    </code>
                                    .
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Command</TableHead>
                                            <TableHead>Schedule</TableHead>
                                            <TableHead>Next Due</TableHead>
                                            <TableHead>Timezone</TableHead>
                                            <TableHead>Flags</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasks.map((task, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <code className="font-mono text-sm font-medium">
                                                            {task.command}
                                                        </code>
                                                        {task.description && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {
                                                                    task.description
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm">
                                                            {
                                                                task.human_readable
                                                            }
                                                        </span>
                                                        <code className="font-mono text-xs text-muted-foreground">
                                                            {task.expression}
                                                        </code>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {task.next_due ? (
                                                        <span className="text-sm whitespace-nowrap">
                                                            {task.next_due}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {task.timezone}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {task.without_overlapping && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px]"
                                                            >
                                                                No Overlap
                                                            </Badge>
                                                        )}
                                                        {task.run_in_background && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px]"
                                                            >
                                                                Background
                                                            </Badge>
                                                        )}
                                                        {!task.without_overlapping &&
                                                            !task.run_in_background && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    —
                                                                </span>
                                                            )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
