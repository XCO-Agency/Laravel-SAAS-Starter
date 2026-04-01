import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import WorkspaceLayout from '@/layouts/settings/workspace-layout';
import { Workspace } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format, formatDistanceToNow } from 'date-fns';
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    RefreshCw,
    Search,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

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

export default function WorkspaceWebhookLogs({
    workspace,
    logs,
}: WebhookLogsProps) {
    const { t } = useTranslations();
    const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
    const [retrying, setRetrying] = useState<string | null>(null);

    const handleRetry = (log: WebhookLog) => {
        setRetrying(log.id);
        router.post(
            `/workspaces/${workspace.id}/webhooks/logs/${log.id}/retry`,
            {},
            {
                onFinish: () => setRetrying(null),
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: t('workspace.settings.title', 'Workspace Settings'),
                    href: `/workspaces/settings`,
                },
                {
                    title: t('workspace.webhooks.title', 'Webhooks'),
                    href: `/workspaces/${workspace.id}/webhooks`,
                },
                {
                    title: t('workspace.webhooks.logs.title', 'Delivery Logs'),
                    href: '',
                },
            ]}
        >
            <Head
                title={t(
                    'workspace.webhooks.logs.page_title',
                    'Webhook Delivery Logs',
                )}
            />

            <WorkspaceLayout
                title={t('workspace.webhooks.logs.heading', 'Delivery Logs')}
                description={t(
                    'workspace.webhooks.logs.description',
                    'Review recent outbound webhook attempts and inspect payloads.',
                )}
                fullWidth
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit(
                                    `/workspaces/${workspace.id}/webhooks`,
                                )
                            }
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('generic.back', 'Back to Webhooks')}
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t(
                                    'workspace.webhooks.logs.recent',
                                    'Recent Deliveries',
                                )}
                            </CardTitle>
                            <CardDescription>
                                {t(
                                    'workspace.webhooks.logs.recent_desc',
                                    'Track the success and failure states of payloads sent by your workspace.',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {logs.data.length === 0 ? (
                                <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed text-center">
                                    <Search className="mb-2 h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">
                                        {t(
                                            'workspace.webhooks.logs.empty',
                                            'No webhook logs found.',
                                        )}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {logs.data.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex flex-col gap-4 rounded-lg border p-4 transition hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="shrink-0 pt-1">
                                                    {log.status &&
                                                    log.status >= 200 &&
                                                    log.status < 300 ? (
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-destructive" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm leading-none font-semibold">
                                                            {log.event_type}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="h-5 font-mono text-[10px]"
                                                        >
                                                            HTTP{' '}
                                                            {log.status ||
                                                                'ERR'}
                                                        </Badge>
                                                    </div>
                                                    <div className="max-w-[300px] truncate text-xs text-muted-foreground sm:max-w-[400px]">
                                                        {log.url}
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground/80">
                                                        {format(
                                                            new Date(
                                                                log.created_at,
                                                            ),
                                                            'MMM d, yyyy HH:mm:ss',
                                                        )}
                                                        <span className="mx-1">
                                                            •
                                                        </span>
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                log.created_at,
                                                            ),
                                                            { addSuffix: true },
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={
                                                        retrying === log.id
                                                    }
                                                    onClick={() =>
                                                        handleRetry(log)
                                                    }
                                                >
                                                    <RefreshCw
                                                        className={`mr-2 h-4 w-4 ${retrying === log.id ? 'animate-spin' : ''}`}
                                                    />
                                                    Retry
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        setSelectedLog(log)
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Inspect
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination Controls */}
                                    {logs.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t pt-4">
                                            <p className="text-sm text-muted-foreground">
                                                Showing {logs.data.length} of{' '}
                                                {logs.total} results
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {logs.links.map((link, i) => (
                                                    <Button
                                                        key={i}
                                                        variant={
                                                            link.active
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() =>
                                                            link.url &&
                                                            router.visit(
                                                                link.url,
                                                            )
                                                        }
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
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
                <Dialog
                    open={!!selectedLog}
                    onOpenChange={(open) => !open && setSelectedLog(null)}
                >
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Payload Inspection</DialogTitle>
                            <DialogDescription>
                                Deep dive into the outbound HTTP request and
                                response.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedLog && (
                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="mb-1 text-muted-foreground">
                                            Event Type
                                        </p>
                                        <p className="font-mono font-semibold">
                                            {selectedLog.event_type}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-muted-foreground">
                                            Target URL
                                        </p>
                                        <p className="truncate font-mono">
                                            {selectedLog.url}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-muted-foreground">
                                            Status Code
                                        </p>
                                        <Badge
                                            variant={
                                                selectedLog.status &&
                                                selectedLog.status < 300
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                        >
                                            {selectedLog.status ||
                                                'Network Error'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-muted-foreground">
                                            Delivered At
                                        </p>
                                        <p>
                                            {format(
                                                new Date(
                                                    selectedLog.created_at,
                                                ),
                                                'MMM d, yyyy HH:mm:ss',
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {selectedLog.error && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-destructive">
                                            Internal Error string
                                        </p>
                                        <pre className="overflow-x-auto rounded-lg bg-destructive/10 p-4 font-mono text-xs text-destructive">
                                            {selectedLog.error}
                                        </pre>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p className="text-sm font-semibold">
                                        Request Payload
                                    </p>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs">
                                        {JSON.stringify(
                                            selectedLog.payload,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </div>

                                {selectedLog.response && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold">
                                            Response Body
                                        </p>
                                        <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs break-words whitespace-pre-wrap">
                                            {selectedLog.response}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </WorkspaceLayout>
        </AppLayout>
    );
}
