import http from '@/lib/http';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Clock, Trash2 } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedNotifications {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface Props {
    notifications: PaginatedNotifications;
    filter: string;
    unreadCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: '/notifications',
    },
];

const FILTER_TABS = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
];

export default function NotificationsIndex({ notifications, filter, unreadCount }: Props) {
    const markAsRead = async (id: string, currentlyRead: boolean) => {
        if (currentlyRead) { return; }

        try {
            await http.patch(`/api/notifications/${id}/read`);
            router.reload({ only: ['notifications', 'unreadCount'] });
        } catch {
            console.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await http.post('/api/notifications/mark-all-read');
            router.reload({ only: ['notifications', 'unreadCount'] });
        } catch {
            console.error('Failed to mark notifications as read');
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await http.delete(`/api/notifications/${id}`);
            router.reload({ only: ['notifications', 'unreadCount'] });
        } catch {
            console.error('Failed to delete notification');
        }
    };

    const clearRead = async () => {
        try {
            await http.delete('/api/notifications/read');
            router.reload({ only: ['notifications', 'unreadCount'] });
        } catch {
            console.error('Failed to clear read notifications');
        }
    };

    const handleFilterChange = (value: string) => {
        router.get('/notifications', value !== 'all' ? { filter: value } : {}, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 md:pt-4">
                <Card className="flex-1">
                    <CardHeader>
                        <div className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>
                                    {notifications.total} total
                                    {unreadCount > 0 && ` · ${unreadCount} unread`}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                                        <Check className="mr-2 h-4 w-4" />
                                        Mark all read
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={clearRead}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear read
                                </Button>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-1 border-b mt-4">
                            {FILTER_TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleFilterChange(tab.value)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                        filter === tab.value
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.value === 'unread' && unreadCount > 0 && (
                                        <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {notifications.data.length === 0 ? (
                            <div className="flex flex-col flex-1 items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-lg">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mr-2 mb-4">
                                    <Bell className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-medium">
                                    {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications Here'}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    {filter === 'unread'
                                        ? "You're all caught up!"
                                        : "When something happens in your workspace, it will appear right here."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notifications.data.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`flex items-start justify-between rounded-lg border p-4 transition-all hover:bg-muted/40 ${!notification.read_at ? 'bg-muted/20 border-primary/20' : ''}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.read_at ? 'bg-primary' : 'bg-transparent'}`} />
                                            <div>
                                                <h4 className="font-semibold text-sm">
                                                    {notification.data?.title || 'System Notification'}
                                                </h4>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {notification.data?.message || 'You have a new message.'}
                                                </p>
                                                {notification.data?.action_url && (
                                                    <Button variant="link" className="p-0 h-auto mt-2 text-xs" asChild>
                                                        <a href={notification.data.action_url}>View Details</a>
                                                    </Button>
                                                )}
                                                <div className="flex items-center text-xs text-muted-foreground mt-2">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {!notification.read_at && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                    onClick={() => markAsRead(notification.id, !!notification.read_at)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                    <span className="sr-only">Mark as read</span>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => deleteNotification(notification.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination Controls */}
                                {notifications.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t pt-4 mt-6">
                                        <div className="text-sm text-muted-foreground">
                                            Showing <span className="font-medium">{notifications.from || 0}</span> to{' '}
                                            <span className="font-medium">{notifications.to || 0}</span> of{' '}
                                            <span className="font-medium">{notifications.total}</span> entries
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {notifications.links.map((link, i) => {
                                                let label = link.label;
                                                if (label.includes('Previous')) { label = 'Prev'; }
                                                if (label.includes('Next')) { label = 'Next'; }

                                                return (
                                                    <Button
                                                        key={i}
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        asChild={!!link.url}
                                                    >
                                                        {link.url ? (
                                                            <Link href={link.url} preserveScroll preserveState>
                                                                {label}
                                                            </Link>
                                                        ) : (
                                                            <span>{label}</span>
                                                        )}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
