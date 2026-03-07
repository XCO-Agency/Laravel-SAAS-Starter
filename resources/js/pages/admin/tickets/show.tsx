import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Support Tickets',
            href: '/admin/tickets',
        },
        {
            title: `Ticket #${ticket.id}`,
            href: `/admin/tickets/${ticket.id}`,
        },
    ];

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
        router.patch(`/admin/tickets/${ticket.id}`, {
            [field]: value
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Ticket ${field} updated.`);
            },
            onFinish: () => setUpdatingParams(false)
        });
    };

    return (
        <AdminLayout>
            <Head title={`Ticket #${ticket.id}`} />

            <div className="flex h-full flex-1 flex-col space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b pb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight">{ticket.subject}</h2>
                            <Badge variant="secondary" className={getStatusColor(ticket.status)}>
                                {ticket.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </div>
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={ticket.user.avatar_url || ''} />
                                    <AvatarFallback>{ticket.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span>{ticket.user.name}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{ticket.user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>Opened {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Controls */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-muted/30 p-4 rounded-lg border">
                        <div className="space-y-1">
                            <Label htmlFor="status-select" className="text-xs text-muted-foreground uppercase tracking-wider">Status</Label>
                            <select
                                id="status-select"
                                value={ticket.status}
                                onChange={(e) => updateTicket('status', e.target.value)}
                                disabled={updatingParams}
                                className="flex h-9 w-full sm:w-36 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="priority-select" className="text-xs text-muted-foreground uppercase tracking-wider">Priority</Label>
                            <select
                                id="priority-select"
                                value={ticket.priority}
                                onChange={(e) => updateTicket('priority', e.target.value)}
                                disabled={updatingParams}
                                className="flex h-9 w-full sm:w-36 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="space-y-6 flex-1">
                    {ticket.replies.map((reply) => (
                        <div key={reply.id} className={`flex ${reply.is_from_admin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex w-full xl:w-4/5 gap-4 ${reply.is_from_admin ? 'flex-row-reverse' : 'flex-row'}`}>
                                <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarImage src={reply.user.avatar_url || ''} alt={reply.user.name} />
                                    <AvatarFallback>{reply.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>

                                <Card className={`w-full ${reply.is_from_admin ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{reply.user.name}</span>
                                                {reply.is_from_admin && (
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-primary/10">Staff</Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground" title={new Date(reply.created_at).toLocaleString()}>
                                                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
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
                    <div className="sticky bottom-0 mt-8 border-t bg-background/95 backdrop-blur pt-4 pb-4">
                        <form onSubmit={submitReply} className="space-y-4">
                            <div>
                                <Textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Write your official response to the user..."
                                    rows={5}
                                    className="resize-y"
                                />
                                {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Replying as staff will notify the user.
                                </p>
                                <Button type="submit" disabled={processing || !data.content.trim()}>
                                    {processing ? 'Sending...' : 'Send Response'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
