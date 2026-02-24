import React from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { Workspace, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
    id: number;
    log_name: string;
    description: string;
    subject_type: string;
    subject_id: number;
    event: string;
    causer?: User;
    properties: Record<string, unknown>;
    created_at: string;
}

interface ActivityLogsProps {
    workspace: Workspace;
    activities: {
        data: Activity[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
}

export default function WorkspaceActivity({ activities }: ActivityLogsProps) {
    const { t } = useTranslations();

    return (
        <AppLayout
            breadcrumbs={[
                { title: t('workspace.settings.title', 'Workspace Settings'), href: `/workspaces/settings` },
                { title: t('workspace.activity.title', 'Activity Log'), href: '' },
            ]}
        >
            <Head title={t('workspace.activity.page_title', 'Activity Log')} />

            <SettingsLayout
                title={t('workspace.activity.heading', 'Activity Logs')}
                description={t('workspace.activity.description', 'Review actions taken by members of this workspace.')}
                fullWidth
            >
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('workspace.activity.recent', 'Recent Activity')}</CardTitle>
                            <CardDescription>
                                {t('workspace.activity.showing', 'Showing the latest 20 events.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activities.data.length === 0 ? (
                                <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                    <p className="text-sm text-muted-foreground">
                                        {t('workspace.activity.empty', 'No activity logged yet.')}
                                    </p>
                                </div>
                            ) : (
                                <div className="relative border-l border-border ml-3 pb-4">
                                    {activities.data.map((activity) => (
                                        <div key={activity.id} className="mb-6 ml-6 flex flex-col gap-1">
                                            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">
                                                    {activity.causer?.name || 'System'}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {activity.description} a {activity.subject_type.split('\\').pop()}
                                                </span>
                                            </div>
                                            <time className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                            </time>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
