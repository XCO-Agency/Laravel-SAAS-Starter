import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { format, formatDistanceToNow } from 'date-fns';
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface ImpersonationLog {
    id: number;
    impersonator_id: number;
    impersonated_id: number;
    ip_address: string | null;
    user_agent: string | null;
    started_at: string;
    ended_at: string | null;
    impersonator: User;
    impersonated: User;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        links: PaginationLink[];
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

interface ImpersonationLogsProps {
    logs: PaginatedData<ImpersonationLog>;
    filters: {
        search: string;
    };
}

export default function ImpersonationLogs({
    logs,
    filters,
}: ImpersonationLogsProps) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== filters.search) {
                router.get(
                    '/admin/impersonation-logs',
                    { search: search },
                    { preserveState: true, replace: true },
                );
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, filters.search]);

    const formatDuration = (start: string, end: string | null) => {
        if (!end) return 'Active';

        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffInSeconds = Math.floor(
            (endDate.getTime() - startDate.getTime()) / 1000,
        );

        if (diffInSeconds < 60) return `${diffInSeconds} s`;

        const minutes = Math.floor(diffInSeconds / 60);
        const seconds = diffInSeconds % 60;

        if (minutes < 60) return `${minutes}m ${seconds} s`;

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        return `${hours}h ${remainingMinutes} m`;
    };

    return (
        <AdminLayout>
            <Head title="Impersonation Logs" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Impersonation Logs
                        </h2>
                        <p className="text-muted-foreground">
                            Immutable audit trail of super-admins impersonating
                            users.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            (window.location.href =
                                '/admin/impersonation-logs/export')
                        }
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                <Card>
                    <CardHeader className="border-b pb-3">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <CardTitle>Impersonation Sessions</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by name or email..."
                                        className="w-full bg-background pl-8 md:w-[300px]"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Impersonator</TableHead>
                                        <TableHead>Target User</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>User Agent</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Started At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center"
                                            >
                                                No impersonation logs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {log.impersonator
                                                                ?.name ||
                                                                'Unknown'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {log.impersonator
                                                                ?.email || ''}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {log.impersonated
                                                                ?.name ||
                                                                'Unknown'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {log.impersonated
                                                                ?.email || ''}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="rounded bg-muted p-1 text-xs">
                                                        {log.ip_address ||
                                                            'N/A'}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <div
                                                        className="max-w-[200px] truncate text-xs"
                                                        title={
                                                            log.user_agent ||
                                                            'N/A'
                                                        }
                                                    >
                                                        {log.user_agent ||
                                                            'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {log.ended_at ? (
                                                        <span className="text-sm">
                                                            {formatDuration(
                                                                log.started_at,
                                                                log.ended_at,
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                        >
                                                            Active
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div
                                                        className="flex flex-col"
                                                        title={new Date(
                                                            log.started_at,
                                                        ).toLocaleString()}
                                                    >
                                                        <span>
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    log.started_at,
                                                                ),
                                                                {
                                                                    addSuffix: true,
                                                                },
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(
                                                                new Date(
                                                                    log.started_at,
                                                                ),
                                                                'MMM d, yyyy HH:mm:ss',
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {logs.meta && logs.meta.last_page > 1 && (
                            <div className="flex items-center justify-between border-t p-4 text-sm text-muted-foreground">
                                <div>
                                    Showing {logs.meta.from} to {logs.meta.to}{' '}
                                    of {logs.meta.total} results
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                        disabled={!logs.links.prev}
                                        onClick={() =>
                                            logs.links.prev &&
                                            router.get(
                                                logs.links.prev,
                                                { search },
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <ChevronLeft className="size-4" />
                                        <span className="sr-only">
                                            Previous Page
                                        </span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                        disabled={!logs.links.next}
                                        onClick={() =>
                                            logs.links.next &&
                                            router.get(
                                                logs.links.next,
                                                { search },
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <ChevronRight className="size-4" />
                                        <span className="sr-only">
                                            Next Page
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
