import { Badge } from '@/components/ui/badge';
import { HelpTooltip } from '@/components/help-tooltip';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ShieldCheck, ShieldOff } from 'lucide-react';

interface WorkspaceSecurityProps {
    require_two_factor: boolean;
    allowed_ips: string[];
}

export default function WorkspaceSecurity({ require_two_factor, allowed_ips }: WorkspaceSecurityProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string } | undefined;

    const { data, setData, put, processing, errors } = useForm({
        require_two_factor,
        allowed_ips: allowed_ips ? allowed_ips.join(', ') : '',
    });

    const save = () => {
        put('/settings/workspace-security', { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Security', href: '/settings/workspace-security' }]}>
            <Head title="Workspace Security" />

            <SettingsLayout title="Workspace Security" description="Manage security policies for your workspace.">
                <div className="space-y-6">
                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <ShieldCheck className="h-4 w-4 shrink-0" />
                            {flash.success}
                        </div>
                    )}

                    {/* 2FA Enforcement Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {data.require_two_factor ? (
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <ShieldOff className="h-5 w-5 text-muted-foreground" />
                                )}
                                Two-Factor Authentication Enforcement
                                {data.require_two_factor && (
                                    <Badge className="ml-2 bg-emerald-500 text-white">Enabled</Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                When enabled, all workspace members must have two-factor authentication set up before they can access the workspace.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="require_2fa" className="flex items-center gap-1.5 text-base font-medium">
                                        Require 2FA for all members
                                        <HelpTooltip content="When enabled, workspace members must enable two-factor authentication via authenticator app or SMS. Members without 2FA will be redirected to set it up upon login." />
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Members without 2FA enabled will be redirected to set it up.
                                    </p>
                                </div>
                                <Switch
                                    id="require_2fa"
                                    checked={data.require_two_factor}
                                    onCheckedChange={(checked) => setData('require_two_factor', checked)}
                                />
                            </div>

                            {data.require_two_factor && (
                                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        Members who haven't enabled 2FA will immediately lose access until they set it up.
                                    </p>
                                </div>
                            )}

                            <Button onClick={save} disabled={processing}>
                                {processing ? 'Saving…' : 'Save Settings'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* IP Allowlist Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                                IP Allowlist
                            </CardTitle>
                            <CardDescription>
                                Restrict access to your workspace to specific IP addresses. Enter multiple IP addresses separated by commas. Leave empty to allow all IPs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="allowed_ips">Allowed IP Addresses</Label>
                                <textarea
                                    id="allowed_ips"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="e.g., 192.168.1.1, 10.0.0.1"
                                    value={data.allowed_ips}
                                    onChange={(e) => setData('allowed_ips', e.target.value)}
                                />
                                {errors.allowed_ips && (
                                    <p className="text-[0.8rem] font-medium text-destructive">{errors.allowed_ips}</p>
                                )}
                            </div>

                            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    <strong>Warning:</strong> Ensure your current IP address is included, or you will be immediately locked out of this workspace upon saving.
                                </p>
                            </div>

                            <Button onClick={save} disabled={processing}>
                                {processing ? 'Saving…' : 'Save Settings'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
