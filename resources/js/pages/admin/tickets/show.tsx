import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
}

interface TicketReply {
    id: number;
    content: string;
    is_from_admin: boolean;
    created_at: string;
    user: User;
}

interface TicketData {
    id: number;
    subject: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    created_at: string;
    updated_at: string;
    user: User;
    replies: TicketReply[];
}

interface ShowProps {
    ticket: TicketData;
}

export default function AdminTicketShow({ ticket }: ShowProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
    });

    const [updatingParams, setUpdatingParams] = useState(false);

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

    const submitReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/tickets/${ticket.id}/replies`, {
            onSuccess: () => {
                reset('content');
                toast.success('Reply sent successfully.');
            },
        });
    };

    const updateTicket = (field: 'status' | 'priority', value: string) => {
        setUpdatingParams(true);
        router.patch(
            `/admin/tickets/${ticket.id}`,
            {
                [field]: value,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Ticket ${field} updated.`);
                },
                onFinish: () => setUpdatingParams(false),
            },
        );
    };

    return (
        <AdminLayout>
            <Head title={`Ticket #${ticket.id}`} />

            <div className="flex h-full flex-1 flex-col space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-6 border-b pb-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {ticket.subject}
                            </h2>
                            <Badge
                                variant="secondary"
                                className={getStatusColor(ticket.status)}
                            >
                                {ticket.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </div>
                        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage
                                        src={ticket.user.avatar_url || ''}
                                    />
                                    <AvatarFallback>
                                        {ticket.user.name
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span>{ticket.user.name}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{ticket.user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>
                                    Opened{' '}
                                    {formatDistanceToNow(
                                        new Date(ticket.created_at),
                                        { addSuffix: true },
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Controls */}
                    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center">
                        <div className="space-y-1">
                            <Label
                                htmlFor="status-select"
                                className="text-xs tracking-wider text-muted-foreground uppercase"
                            >
                                Status
                            </Label>
                            <select
                                id="status-select"
                                value={ticket.status}
                                onChange={(e) =>
                                    updateTicket('status', e.target.value)
                                }
                                disabled={updatingParams}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-36"
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label
                                htmlFor="priority-select"
                                className="text-xs tracking-wider text-muted-foreground uppercase"
                            >
                                Priority
                            </Label>
                            <select
                                id="priority-select"
                                value={ticket.priority}
                                onChange={(e) =>
                                    updateTicket('priority', e.target.value)
                                }
                                disabled={updatingParams}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-36"
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Conversation Thread */}
                <div className="flex-1 space-y-6">
                    {ticket.replies.map((reply) => (
                        <div
                            key={reply.id}
                            className={`flex ${reply.is_from_admin ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`flex w-full gap-4 xl:w-4/5 ${reply.is_from_admin ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarImage
                                        src={reply.user.avatar_url || ''}
                                        alt={reply.user.name}
                                    />
                                    <AvatarFallback>
                                        {reply.user.name
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <Card
                                    className={`w-full ${reply.is_from_admin ? 'border-primary/20 bg-primary/5' : 'bg-muted/50'}`}
                                >
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                    {reply.user.name}
                                                </span>
                                                {reply.is_from_admin && (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 bg-primary/10 px-1.5 text-[10px]"
                                                    >
                                                        Staff
                                                    </Badge>
                                                )}
                                            </div>
                                            <span
                                                className="text-xs text-muted-foreground"
                                                title={new Date(
                                                    reply.created_at,
                                                ).toLocaleString()}
                                            >
                                                {formatDistanceToNow(
                                                    new Date(reply.created_at),
                                                    { addSuffix: true },
                                                )}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                            {reply.content}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Form */}
                {ticket.status !== 'closed' && (
                    <div className="sticky bottom-0 mt-8 border-t bg-background/95 pt-4 pb-4 backdrop-blur">
                        <form onSubmit={submitReply} className="space-y-4">
                            <div>
                                <Textarea
                                    value={data.content}
                                    onChange={(e) =>
                                        setData('content', e.target.value)
                                    }
                                    placeholder="Write your official response to the user..."
                                    rows={5}
                                    className="resize-y"
                                />
                                {errors.content && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.content}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Replying as staff will notify the user.
                                </p>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing || !data.content.trim()
                                    }
                                >
                                    {processing
                                        ? 'Sending...'
                                        : 'Send Response'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
