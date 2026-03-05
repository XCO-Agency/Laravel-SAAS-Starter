import { HelpTooltip } from '@/components/help-tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type Workspace } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    Activity as ActivityIcon,
    CreditCard,
    Edit,
    LogIn,
    Plus,
    Settings,
    Trash2,
    UserPlus,
} from 'lucide-react';

interface ActivityItem {
    id: number;
    description: string;
    event: string;
    subject_type: string;
    causer_name: string;
    properties: Record<string, unknown>;
    created_at: string;
}

interface ActivityFeedProps {
    workspace: Workspace;
    activities: {
        data: ActivityItem[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    eventTypes: string[];
    currentFilter: string;
}

const eventConfig: Record<string, { icon: typeof ActivityIcon; color: string; label: string }> = {
    created: { icon: Plus, color: 'text-emerald-500', label: 'Created' },
    updated: { icon: Edit, color: 'text-blue-500', label: 'Updated' },
    deleted: { icon: Trash2, color: 'text-red-500', label: 'Deleted' },
    login: { icon: LogIn, color: 'text-indigo-500', label: 'Sign In' },
    invited: { icon: UserPlus, color: 'text-violet-500', label: 'Invited' },
    billing: { icon: CreditCard, color: 'text-amber-500', label: 'Billing' },
    settings: { icon: Settings, color: 'text-slate-500', label: 'Settings' },
};

function getEventConfig(event: string) {
    return eventConfig[event] || { icon: ActivityIcon, color: 'text-muted-foreground', label: event };
}

export default function WorkspaceActivity({ activities, eventTypes, currentFilter }: ActivityFeedProps) {
    const { t } = useTranslations();

    const handleFilterChange = (value: string) => {
        router.get(
            window.location.pathname,
            value === 'all' ? {} : { event: value },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: t('workspace.settings.title', 'Workspace Settings'), href: '/workspaces/settings' },
                { title: t('workspace.activity.title', 'Activity Feed'), href: '' },
            ]}
        >
            <Head title={t('workspace.activity.page_title', 'Activity Feed')} />

            <SettingsLayout
                title={t('workspace.activity.heading', 'Activity Feed')}
                description={t('workspace.activity.description', 'Live feed of workspace events — member changes, settings updates, and more.')}
                fullWidth
            >
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <ActivityIcon className="h-5 w-5" />
                                        {t('workspace.activity.recent', 'Recent Activity')}
                                        <HelpTooltip content="This feed shows actions taken by workspace members, including settings changes, member additions, and other key events. Activity is retained for 90 days." />
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {t('workspace.activity.showing', 'Showing the latest workspace events.')}
                                    </CardDescription>
                                </div>
                                {eventTypes.length > 0 && (
                                    <Select value={currentFilter} onValueChange={handleFilterChange}>
                                        <SelectTrigger className="w-36">
                                            <SelectValue placeholder="Filter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Events</SelectItem>
                                            {eventTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {getEventConfig(type).label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {activities.data.length === 0 ? (
                                <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                    <p className="text-sm text-muted-foreground">
                                        {t('workspace.activity.empty', 'No activity logged yet.')}
                                    </p>
                                </div>
                            ) : (
                                <div className="relative ml-3 border-l border-border pb-4">
                                    {activities.data.map((activity) => {
                                        const config = getEventConfig(activity.event);
                                        const Icon = config.icon;

                                        return (
                                            <div key={activity.id} className="mb-6 ml-6 flex flex-col gap-1">
                                                <div className={`absolute -left-2.5 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background ring-4 ring-background`}>
                                                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold">
                                                        {activity.causer_name}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {activity.description}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {activity.subject_type}
                                                    </Badge>
                                                </div>
                                                {activity.properties &&
                                                    Object.keys(activity.properties).length > 0 &&
                                                    activity.properties.attributes && (
                                                        <div className="mt-1 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                                                            {Object.entries(
                                                                activity.properties.attributes as Record<string, unknown>,
                                                            )
                                                                .slice(0, 3)
                                                                .map(([key, val]) => (
                                                                    <span key={key} className="mr-3">
                                                                        <span className="font-medium">{key}:</span>{' '}
                                                                        {String(val)}
                                                                    </span>
                                                                ))}
                                                        </div>
                                                    )}
                                                <time className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(activity.created_at), {
                                                        addSuffix: true,
                                                    })}
                                                </time>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {(activities.prev_page_url || activities.next_page_url) && (
                                <div className="flex items-center justify-between border-t pt-4">
                                    <Link
                                        href={activities.prev_page_url || '#'}
                                        className={`text-sm ${!activities.prev_page_url ? 'pointer-events-none text-muted-foreground/40' : 'text-primary hover:underline'}`}
                                    >
                                        ← Previous
                                    </Link>
                                    <span className="text-xs text-muted-foreground">
                                        Page {activities.current_page} of {activities.last_page}
                                    </span>
                                    <Link
                                        href={activities.next_page_url || '#'}
                                        className={`text-sm ${!activities.next_page_url ? 'pointer-events-none text-muted-foreground/40' : 'text-primary hover:underline'}`}
                                    >
                                        Next →
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
