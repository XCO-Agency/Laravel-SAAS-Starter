import { useState } from 'react';
import { Layout } from '@/layouts/settings-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Ticket, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Support Tickets',
        href: '/settings/tickets',
    },
];

interface TicketData {
    id: number;
    subject: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    replies_count: number;
    created_at: string;
    updated_at: string;
}

interface IndexProps {
    tickets: {
        data: TicketData[];
        links: any[];
    };
}

export default function TicketsIndex({ tickets }: IndexProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        subject: '',
        content: '',
        priority: 'normal',
    });

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

    const submitTicket = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/tickets', {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
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
        <Layout breadcrumbs={breadcrumbs}>
            <Head title="Support Tickets" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Support Tickets</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your support requests and communicate with our team.
                        </p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) {
                            reset();
                            clearErrors();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Ticket
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={submitTicket}>
                                <DialogHeader>
                                    <DialogTitle>Create Support Ticket</DialogTitle>
                                    <DialogDescription>
                                        Describe your issue and our team will get back to you shortly.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            placeholder="What do you need help with?"
                                        />
                                        {errors.subject && <span className="text-sm text-red-500">{errors.subject}</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <select
                                            id="priority"
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value as any)}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                        {errors.priority && <span className="text-sm text-red-500">{errors.priority}</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="content">Details</Label>
                                        <Textarea
                                            id="content"
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                            placeholder="Please provide as much detail as possible..."
                                            rows={5}
                                        />
                                        {errors.content && <span className="text-sm text-red-500">{errors.content}</span>}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={processing}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Submitting...' : 'Submit Ticket'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {tickets.data.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Replies</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.data.map((ticket) => (
                                    <TableRow key={ticket.id}>
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
                                        <TableCell>{ticket.replies_count}</TableCell>
                                        <TableCell suppressHydrationWarning>
                                            {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/settings/tickets/${ticket.id}`}>View</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Ticket className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No tickets yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            You haven't submitted any support requests. If you need help, feel free to reach out.
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
