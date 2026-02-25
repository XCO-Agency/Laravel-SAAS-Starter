import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from '@/hooks/use-translations';
import { Link } from '@inertiajs/react';
import { Bell, Check, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

// Define standard Laravel Database Notification structure mapping
interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: any;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export function NotificationsDropdown() {
    const { t } = useTranslations();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications', {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });
            // Optimistically update the local state
            setNotifications(
                notifications.map((n) =>
                    n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
                ),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`/api/notifications/mark-all-read`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });
            // Optimistically update the local state
            setNotifications(
                notifications.map((n) => ({
                    ...n,
                    read_at: new Date().toISOString(),
                })),
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    useEffect(() => {
        // Fetch initially
         
        fetchNotifications();

        // Poll every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Also fetch when we open the dropdown to ensure it's completely fresh
    useEffect(() => {
        if (open) {
             
            fetchNotifications();
        }
    }, [open]);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full"
                >
                    <Bell className="h-5 w-5 opacity-80" />
                    {unreadCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="font-semibold">
                        {t('notifications.title', 'Notifications')}
                    </span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                                e.preventDefault();
                                markAllAsRead();
                            }}
                        >
                            <Check className="mr-1 h-3 w-3" />
                            {t('notifications.mark_all_read', 'Mark all as read')}
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => {
                                        if (!notification.read_at) {
                                            markAsRead(notification.id);
                                        }
                                        if (notification.data.action_url) {
                                            setOpen(false);
                                            window.location.href = notification.data.action_url;
                                        }
                                    }}
                                    className={`flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${!notification.read_at ? 'bg-muted/30' : ''
                                        }`}
                                >
                                    <div className="mt-0.5 relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Info className="h-4 w-4" />
                                        {!notification.read_at && (
                                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background"></span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {notification.data.title || 'System Notification'}
                                        </p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {notification.data.message || 'You have a new notification.'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(notification.created_at).toLocaleDateString([], {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-[200px] flex-col items-center justify-center space-y-3 p-4 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Bell className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'notifications.empty',
                                    "You don't have any notifications right now.",
                                )}
                            </p>
                        </div>
                    )}
                </ScrollArea>
                <div className="border-t p-2">
                    <Button variant="ghost" className="w-full justify-center text-sm" asChild>
                        <Link href="/notifications" onClick={() => setOpen(false)}>
                            {t('notifications.view_all', 'View all notifications')}
                        </Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
