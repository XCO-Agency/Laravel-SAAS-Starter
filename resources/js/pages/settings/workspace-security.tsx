import { Badge } from '@/components/ui/badge';
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
}

export default function WorkspaceSecurity({ require_two_factor }: WorkspaceSecurityProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string } | undefined;

    const { data, setData, put, processing } = useForm({
        require_two_factor,
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
                                    <Label htmlFor="require_2fa" className="text-base font-medium">
                                        Require 2FA for all members
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
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
