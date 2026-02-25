import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { Workspace } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft, CheckCircle2, XCircle, Search, Eye } from 'lucide-react';

interface WebhookEndpoint {
    id: number;
    url: string;
}

interface WebhookLog {
    id: string;
    workspace_id: number;
    webhook_endpoint_id: number | null;
    webhook_endpoint: WebhookEndpoint | null;
    event_type: string;
    url: string;
    status: number | null;
    payload: unknown;
    response: string | null;
    error: string | null;
    created_at: string;
}

interface WebhookLogsProps {
    workspace: Workspace;
    logs: {
        data: WebhookLog[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function WorkspaceWebhookLogs({ workspace, logs }: WebhookLogsProps) {
    const { t } = useTranslations();
    const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

    return (
        <AppLayout
            breadcrumbs={[
                { title: t('workspace.settings.title', 'Workspace Settings'), href: `/workspaces/settings` },
                { title: t('workspace.webhooks.title', 'Webhooks'), href: `/workspaces/${workspace.id}/webhooks` },
                { title: t('workspace.webhooks.logs.title', 'Delivery Logs'), href: '' },
            ]}
        >
            <Head title={t('workspace.webhooks.logs.page_title', 'Webhook Delivery Logs')} />

            <SettingsLayout
                title={t('workspace.webhooks.logs.heading', 'Delivery Logs')}
                description={t('workspace.webhooks.logs.description', 'Review recent outbound webhook attempts and inspect payloads.')}
                fullWidth
            >
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Button variant="outline" onClick={() => router.visit(`/workspaces/${workspace.id}/webhooks`)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('generic.back', 'Back to Webhooks')}
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('workspace.webhooks.logs.recent', 'Recent Deliveries')}</CardTitle>
                            <CardDescription>
                                {t('workspace.webhooks.logs.recent_desc', 'Track the success and failure states of payloads sent by your workspace.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {logs.data.length === 0 ? (
                                <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed text-center">
                                    <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        {t('workspace.webhooks.logs.empty', 'No webhook logs found.')}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {logs.data.map((log) => (
                                        <div key={log.id} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-muted/50">
                                            <div className="flex items-start gap-4">
                                                <div className="pt-1 shrink-0">
                                                    {log.status && log.status >= 200 && log.status < 300 ? (
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-destructive" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-sm leading-none">{log.event_type}</span>
                                                        <Badge variant="outline" className="text-[10px] h-5 font-mono">
                                                            HTTP {log.status || 'ERR'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[300px] sm:max-w-[400px]">
                                                        {log.url}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground/80 flex gap-1 items-center mt-1">
                                                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                                                        <span className="mx-1">•</span>
                                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button size="sm" variant="secondary" onClick={() => setSelectedLog(log)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Inspect
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination Controls */}
                                    {logs.last_page > 1 && (
                                        <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">
                                                Showing {logs.data.length} of {logs.total} results
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {logs.links.map((link, i) => (
                                                    <Button
                                                        key={i}
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() => link.url && router.visit(link.url)}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Inspect Modal */}
                <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Payload Inspection</DialogTitle>
                            <DialogDescription>
                                Deep dive into the outbound HTTP request and response.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedLog && (
                            <div className="space-y-6 py-4">

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground mb-1">Event Type</p>
                                        <p className="font-semibold font-mono">{selectedLog.event_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">Target URL</p>
                                        <p className="font-mono truncate">{selectedLog.url}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">Status Code</p>
                                        <Badge variant={selectedLog.status && selectedLog.status < 300 ? 'default' : 'destructive'}>
                                            {selectedLog.status || 'Network Error'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">Delivered At</p>
                                        <p>{format(new Date(selectedLog.created_at), 'MMM d, yyyy HH:mm:ss')}</p>
                                    </div>
                                </div>

                                {selectedLog.error && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-destructive">Internal Error string</p>
                                        <pre className="p-4 rounded-lg bg-destructive/10 text-destructive text-xs font-mono overflow-x-auto">
                                            {selectedLog.error}
                                        </pre>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p className="text-sm font-semibold">Request Payload</p>
                                    <pre className="p-4 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
                                        {JSON.stringify(selectedLog.payload, null, 2)}
                                    </pre>
                                </div>

                                {selectedLog.response && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold">Response Body</p>
                                        <pre className="p-4 rounded-lg bg-muted text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words">
                                            {selectedLog.response}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </SettingsLayout>
        </AppLayout>
    );
}
