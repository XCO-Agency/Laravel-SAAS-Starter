import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Copy, Power, Shield } from 'lucide-react';
import { useState } from 'react';

interface MaintenanceConfig {
    active: boolean;
    message: string;
    secret: string;
    allowed_ips?: string[];
}

interface Props {
    maintenance: MaintenanceConfig;
    isDown: boolean;
}

export default function AdminMaintenance({ maintenance, isDown }: Props) {
    const [copied, setCopied] = useState(false);

    const form = useForm({
        message: maintenance.message || '',
        allowed_ips: maintenance.allowed_ips ? maintenance.allowed_ips.join(', ') : '',
    });

    const handleToggle = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/maintenance/toggle', {
            preserveScroll: true,
        });
    };

    const copySecret = () => {
        if (maintenance.secret) {
            navigator.clipboard.writeText(`${window.location.origin}/${maintenance.secret}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AdminLayout>
            <Head title="Maintenance Mode" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl border border-sidebar-border/70 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Shield className="h-6 w-6 text-primary" />
                            Maintenance Mode
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Control application availability for end users
                        </p>
                    </div>
                    <Badge variant={isDown ? 'destructive' : 'default'} className="text-sm px-3 py-1">
                        {isDown ? 'Maintenance Active' : 'Application Live'}
                    </Badge>
                </div>

                {isDown && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive dark:bg-destructive/10">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <p>
                                The application is currently in maintenance mode. Regular users cannot access the site.
                            </p>
                        </div>

                        {maintenance.secret && (
                            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Bypass Secret URL</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Share this URL to allow access during maintenance:
                                    </p>
                                    <code className="mt-2 block text-xs bg-background rounded p-2 border truncate">
                                        {window.location.origin}/{maintenance.secret}
                                    </code>
                                </div>
                                <Button variant="outline" size="sm" onClick={copySecret} className="shrink-0">
                                    <Copy className="h-4 w-4 mr-1.5" />
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleToggle}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>
                                Customize the maintenance message. A bypass secret will be generated automatically.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="message">Custom Message (optional)</Label>
                                    <Textarea
                                        id="message"
                                        value={form.data.message}
                                        onChange={(e) => form.setData('message', e.target.value)}
                                        placeholder="We're performing scheduled maintenance. We'll be back shortly."
                                        rows={3}
                                        disabled={isDown}
                                    />
                                    {form.errors.message && (
                                        <p className="text-xs text-destructive">{form.errors.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="allowed_ips">Allowed IP Addresses (optional)</Label>
                                    <div className="text-[0.8rem] text-muted-foreground pb-1 leading-snug">
                                        Comma-separated list of IP addresses that can bypass the maintenance screen without a secret URL.
                                    </div>
                                    <Textarea
                                        id="allowed_ips"
                                        value={form.data.allowed_ips}
                                        onChange={(e) => form.setData('allowed_ips', e.target.value)}
                                        placeholder="192.168.1.1, 10.0.0.5"
                                        rows={2}
                                        disabled={isDown}
                                    />
                                    {form.errors.allowed_ips && (
                                        <p className="text-xs text-destructive">{form.errors.allowed_ips}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    variant={isDown ? 'default' : 'destructive'}
                                    disabled={form.processing}
                                    className="gap-2"
                                >
                                    <Power className="h-4 w-4" />
                                    {form.processing
                                        ? 'Processing...'
                                        : isDown
                                            ? 'Bring Application Online'
                                            : 'Enable Maintenance Mode'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AdminLayout >
    );
}
