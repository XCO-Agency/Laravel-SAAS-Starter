import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Clock } from 'lucide-react';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: '/notifications',
    },
];

export default function NotificationsIndex({ notifications }: { notifications: PaginatedNotifications }) {
    const markAsRead = async (id: string, currentlyRead: boolean) => {
        if (currentlyRead) return;

        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });
            // Reload the page smoothly via Inertia to get fresh data
            router.reload({ only: ['notifications'] });
        } catch (_error) {
            console.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });
            router.reload({ only: ['notifications'] });
        } catch (_error) {
            console.error('Failed to mark notifications as read');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 md:pt-4">
                <Card className="flex-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>View your entire notification history ({notifications.total})</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {notifications.data.length === 0 ? (
                            <div className="flex flex-col flex-1 items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-lg">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mr-2 mb-4">
                                    <Bell className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-medium">No Notifications Here</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    You're all caught up! When something happens in your workspace, it will appear right here.
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
                                        {!notification.read_at && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => markAsRead(notification.id, !!notification.read_at)}>
                                                <Check className="h-4 w-4" />
                                                <span className="sr-only">Mark as read</span>
                                            </Button>
                                        )}
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
                                                // Clean up the label which may contain HTML entities like &laquo;
                                                let label = link.label;
                                                if (label.includes('Previous')) label = 'Prev';
                                                if (label.includes('Next')) label = 'Next';

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
