import { AdminLayout } from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Ticket } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Support Tickets',
        href: '/admin/tickets',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
}

interface TicketData {
    id: number;
    subject: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    created_at: string;
    updated_at: string;
    user: User;
}

interface IndexProps {
    tickets: {
        data: TicketData[];
        links: any[];
    };
    filters: {
        status?: string;
        search?: string;
    };
}

export default function AdminTicketsIndex({ tickets, filters }: IndexProps) {
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value || undefined };

        router.get('/admin/tickets', newFilters as Record<string, any>, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusColor = (status: TicketData['status']) => {
        switch (status) {
            case 'open':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'in_progress':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
            case 'resolved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'closed':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const getPriorityColor = (priority: TicketData['priority']) => {
        switch (priority) {
            case 'low':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            case 'normal':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'high':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
            case 'urgent':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Support Tickets" />

            <div className="flex h-full flex-1 flex-col space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Support Tickets</h2>
                        <p className="text-muted-foreground">Manage and resolve user support requests.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Input
                        placeholder="Search tickets by subject..."
                        defaultValue={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="max-w-sm"
                    />

                    <select
                        defaultValue={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {tickets.data.length > 0 ? (
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Requested</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.data.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={ticket.user.avatar_url || ''} />
                                                    <AvatarFallback>{ticket.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm leading-none">{ticket.user.name}</span>
                                                    <span className="text-xs text-muted-foreground mt-1">{ticket.user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{ticket.subject}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={getStatusColor(ticket.status)}>
                                                {ticket.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                                                {ticket.priority.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell suppressHydrationWarning className="text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/tickets/${ticket.id}`}>Review</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Ticket className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No tickets found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            There are currently no support tickets matching your filters.
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
