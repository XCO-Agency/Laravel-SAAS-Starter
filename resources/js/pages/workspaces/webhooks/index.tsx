import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, useForm, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { Workspace } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Activity, Plus } from 'lucide-react';

interface WebhookEndpoint {
    id: number;
    url: string;
    secret: string;
    events: string[] | null;
    is_active: boolean;
    created_at: string;
}

interface WebhookLogsProps {
    workspace: Workspace;
    endpoints: WebhookEndpoint[];
}

export default function WorkspaceWebhooks({ workspace, endpoints }: WebhookLogsProps) {
    const { t } = useTranslations();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        url: '',
        events: [] as string[],
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/workspaces/${workspace.id}/webhooks`, {
            onSuccess: () => {
                reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const deleteEndpoint = (endpointId: number) => {
        if (confirm('Are you sure you want to delete this webhook endpoint?')) {
            router.delete(`/workspaces/${workspace.id}/webhooks/${endpointId}`);
        }
    };

    const pingEndpoint = (endpointId: number) => {
        router.post(`/workspaces/${workspace.id}/webhooks/${endpointId}/ping`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: t('workspace.settings.title', 'Workspace Settings'), href: `/workspaces/settings` },
                { title: t('workspace.webhooks.title', 'Webhooks'), href: '' },
            ]}
        >
            <Head title={t('workspace.webhooks.page_title', 'Configuration & Webhooks')} />

            <SettingsLayout
                title={t('workspace.webhooks.heading', 'Webhooks')}
                description={t('workspace.webhooks.description', 'Manage external webhook endpoints triggered by workspace activity.')}
                fullWidth
            >
                <div className="space-y-6">
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => router.visit(`/workspaces/${workspace.id}/webhooks/logs`)}>
                            <Activity className="mr-2 h-4 w-4" />
                            {t('workspace.webhooks.view_logs', 'Delivery Logs')}
                        </Button>
                        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                            setIsCreateModalOpen(open);
                            if (!open) {
                                reset();
                                clearErrors();
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('workspace.webhooks.create_button', 'Add Webhook')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('workspace.webhooks.create_title', 'Configure New Webhook')}</DialogTitle>
                                    <DialogDescription>
                                        {t('workspace.webhooks.create_description', 'Configure a secure HTTPS endpoint to capture external payloads.')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={submit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="url">Payload URL</Label>
                                        <Input
                                            id="url"
                                            type="url"
                                            value={data.url}
                                            onChange={(e) => setData('url', e.target.value)}
                                            placeholder="https://example.com/webhooks"
                                            required
                                        />
                                        <InputError message={errors.url} />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <Spinner className="mr-2" />}
                                            {t('workspace.webhooks.save', 'Save Webhook')}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('workspace.webhooks.registered_endpoints', 'Registered Endpoints')}</CardTitle>
                            <CardDescription>
                                {t('workspace.webhooks.endpoints_desc', 'Endpoints currently receiving payloads generated within your workspace.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {endpoints.length === 0 ? (
                                <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                    <p className="text-sm text-muted-foreground">
                                        {t('workspace.webhooks.empty', 'No generic webhooks configured.')}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {endpoints.map((endpoint) => (
                                        <div key={endpoint.id} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{endpoint.url}</span>
                                                    {endpoint.is_active ? (
                                                        <Badge variant="default" className="text-[10px] h-5">Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-[10px] h-5">Inactive</Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    Secret: {endpoint.secret}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex gap-1 items-center mt-1">
                                                    Created {formatDistanceToNow(new Date(endpoint.created_at), { addSuffix: true })}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button size="sm" variant="outline" onClick={() => pingEndpoint(endpoint.id)}>
                                                    <Activity className="mr-2 h-4 w-4" />
                                                    Ping
                                                </Button>
                                                <Button size="icon" variant="destructive" onClick={() => deleteEndpoint(endpoint.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
