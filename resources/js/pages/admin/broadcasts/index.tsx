import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
}

interface BroadcastMessage {
    id: number;
    subject: string;
    body: string;
    send_via_email: boolean;
    send_via_in_app: boolean;
    target_segment: string;
    sent_at: string;
    sender: User;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: BroadcastMessage[];
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

interface Props {
    broadcasts: PaginatedData;
}

export default function BroadcastsIndex({ broadcasts }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        subject: '',
        body: '',
        send_via_email: false,
        send_via_in_app: true,
        target_segment: 'all_users',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/broadcasts', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                toast.success('Broadcast has been queued for delivery.');
            },
        });
    };

    const handleModalOpenChange = (open: boolean) => {
        setIsCreateModalOpen(open);
        if (!open) {
            reset();
            clearErrors();
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderPagination = () => {
        const { meta } = broadcasts;
        if (!meta || meta.last_page <= 1) return null;

        return (
            <div className="flex items-center justify-between px-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    Showing {meta.from} to {meta.to} of {meta.total} results
                </div>
                <div className="flex items-center space-x-2">
                    {meta.links.map((link, i) => (
                        <Button
                            key={i}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            disabled={!link.url}
                            className={link.active ? 'pointer-events-none' : ''}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <AdminLayout>
            <Head title="Broadcast Notifications" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Broadcast Notifications</h1>
                        <p className="text-muted-foreground">Send mass messages via email or in-app notifications.</p>
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={handleModalOpenChange}>
                        <DialogTrigger asChild>
                            <Button>New Broadcast</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create Broadcast</DialogTitle>
                                <DialogDescription>Compose a new message to broadcast to users.</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={submit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        placeholder="Important Update..."
                                    />
                                    {errors.subject && <div className="text-sm text-red-500">{errors.subject}</div>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="body">Message Body</Label>
                                    <Textarea
                                        id="body"
                                        value={data.body}
                                        onChange={(e) => setData('body', e.target.value)}
                                        placeholder="Hello everyone,"
                                        className="h-32"
                                    />
                                    {errors.body && <div className="text-sm text-red-500">{errors.body}</div>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="target_segment">Target Segment</Label>
                                    <Select
                                        value={data.target_segment}
                                        onValueChange={(value) => setData('target_segment', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select target segment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all_users">All Users</SelectItem>
                                            <SelectItem value="workspace_owners">Workspace Owners</SelectItem>
                                            <SelectItem value="super_admins">Super Admins</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.target_segment && <div className="text-sm text-red-500">{errors.target_segment}</div>}
                                </div>

                                <div className="space-y-4 pt-2">
                                    <Label>Delivery Channels</Label>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="send_via_in_app"
                                            checked={data.send_via_in_app}
                                            onCheckedChange={(checked) => setData('send_via_in_app', checked as boolean)}
                                        />
                                        <label
                                            htmlFor="send_via_in_app"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            In-App Notification
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="send_via_email"
                                            checked={data.send_via_email}
                                            onCheckedChange={(checked) => setData('send_via_email', checked as boolean)}
                                        />
                                        <label
                                            htmlFor="send_via_email"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Email Notification
                                        </label>
                                    </div>
                                    {errors.channels && <div className="text-sm text-red-500">{errors.channels}</div>}
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="button" variant="outline" className="mr-2" onClick={() => setIsCreateModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Dispatching...' : 'Dispatch Broadcast'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Target Segment</TableHead>
                                <TableHead>Channels</TableHead>
                                <TableHead>Sender</TableHead>
                                <TableHead>Sent At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {broadcasts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No broadcasts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                broadcasts.data.map((broadcast) => (
                                    <TableRow key={broadcast.id}>
                                        <TableCell className="font-medium">{broadcast.subject}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                                                {broadcast.target_segment.replace('_', ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {broadcast.send_via_in_app && (
                                                    <span className="inline-flex items-center space-x-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        <span>In-App</span>
                                                    </span>
                                                )}
                                                {broadcast.send_via_email && (
                                                    <span className="inline-flex items-center space-x-1 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                                        <span>Email</span>
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{broadcast.sender?.name}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(broadcast.sent_at)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {renderPagination()}
            </div>
        </AdminLayout>
    );
}
