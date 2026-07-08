import { Github } from '@/components/brand-icons';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import ProfileLayout from '@/layouts/settings/profile-layout';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Link2Off, Unlink } from 'lucide-react';

interface ConnectedAccount {
    provider: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
    created_at: string;
}

interface ProviderItem {
    provider: string;
    connected: boolean;
    account: ConnectedAccount | null;
}

interface Props {
    providers: ProviderItem[];
    hasPassword: boolean;
}

const PROVIDER_CONFIG: Record<
    string,
    { label: string; icon: React.ReactNode; color: string }
> = {
    github: {
        label: 'GitHub',
        icon: <Github className="h-5 w-5" />,
        color: 'bg-gray-900 text-white dark:bg-gray-700',
    },
    google: {
        label: 'Google',
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                />
            </svg>
        ),
        color: 'bg-white text-gray-800 border dark:bg-gray-800 dark:text-white',
    },
};

export default function ConnectedAccounts({ providers, hasPassword }: Props) {
    const { props } = usePage<
        SharedData & { flash: { success?: string; error?: string } }
    >();
    const flash = props.flash;

    const disconnect = (provider: string) => {
        if (confirm(`Disconnect your ${provider} account?`)) {
            router.delete(`/settings/connected-accounts/${provider}`, {
                preserveScroll: true,
            });
        }
    };

    const connect = (provider: string) => {
        window.location.href = `/auth/${provider}/redirect`;
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Connected Accounts',
                    href: '/settings/connected-accounts',
                },
            ]}
        >
            <Head title="Connected Accounts" />
            <ProfileLayout
                title="Connected Accounts"
                description="Manage your linked social login providers."
            >
                <div className="space-y-4">
                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                            {flash.error}
                        </div>
                    )}

                    {providers.map(({ provider, connected, account }) => {
                        const config = PROVIDER_CONFIG[provider];
                        if (!config) {
                            return null;
                        }

                        return (
                            <Card key={provider}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.color}`}
                                            >
                                                {config.icon}
                                            </span>
                                            <div>
                                                <CardTitle className="text-base">
                                                    {config.label}
                                                </CardTitle>
                                                <CardDescription>
                                                    {connected
                                                        ? `Connected as ${account?.name || account?.email || 'unknown'}`
                                                        : 'Not connected'}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        {connected ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    disconnect(provider)
                                                }
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Unlink className="mr-1.5 h-4 w-4" />
                                                Disconnect
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    connect(provider)
                                                }
                                            >
                                                <Link2Off className="mr-1.5 h-4 w-4" />
                                                Connect
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                {connected && account?.email && (
                                    <CardContent className="pt-0">
                                        <p className="text-xs text-muted-foreground">
                                            Email: {account.email}
                                            {account.created_at &&
                                                ` · Linked ${new Date(account.created_at).toLocaleDateString()}`}
                                        </p>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}

                    {!hasPassword && (
                        <p className="text-xs text-muted-foreground">
                            You have no password set. You must keep at least one
                            connected account to sign in.
                        </p>
                    )}
                </div>
            </ProfileLayout>
        </AppLayout>
    );
}
