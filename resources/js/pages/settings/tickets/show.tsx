import Layout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
    id: number;
    name: string;
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
    replies: TicketReply[];
}

interface ShowProps {
    ticket: TicketData;
}

export default function TicketShow({ ticket }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Support Tickets',
            href: '/settings/tickets',
        },
        {
            title: ticket.subject,
            href: `/settings/tickets/${ticket.id}`,
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
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

    const submitReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/settings/tickets/${ticket.id}/replies`, {
            onSuccess: () => reset('content'),
        });
    };

    return (
        <Layout>
            <Head title={ticket.subject} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{ticket.subject}</h2>
                        <div className="mt-2 flex items-center space-x-3 text-sm text-muted-foreground">
                            <span>Started {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                            <span>•</span>
                            <Badge variant="secondary" className={getStatusColor(ticket.status)}>
                                {ticket.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                                {ticket.priority.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {ticket.replies.map((reply) => (
                        <div key={reply.id} className={`flex ${reply.is_from_admin ? 'justify-start' : 'justify-end'}`}>
                            <div className={`flex w-full max-w-3xl gap-4 ${reply.is_from_admin ? 'flex-row' : 'flex-row-reverse'}`}>
                                <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarImage src={reply.user.avatar_url || ''} alt={reply.user.name} />
                                    <AvatarFallback>{reply.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>

                                <Card className={`w-full ${reply.is_from_admin ? 'bg-muted/50' : 'bg-primary/5 border-primary/20'}`}>
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">{reply.is_from_admin ? 'Support Team' : 'You'}</span>
                                            <span className="text-xs text-muted-foreground">
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

                {ticket.status !== 'closed' ? (
                    <div className="mt-8 border-t pt-6">
                        <form onSubmit={submitReply} className="space-y-4">
                            <div>
                                <Textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Write your reply here..."
                                    rows={4}
                                    className="resize-y"
                                />
                                {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing || !data.content.trim()}>
                                    {processing ? 'Sending...' : 'Send Reply'}
                                </Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="mt-8 rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                        This ticket has been closed. If you need further assistance, please open a new ticket.
                    </div>
                )}
            </div>
        </Layout>
    );
}
