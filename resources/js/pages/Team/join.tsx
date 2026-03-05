import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface JoinProps {
    inviteLink: {
        token: string;
        role: string;
        workspace_name: string;
    };
}

export default function Join({ inviteLink }: JoinProps) {
    const { auth } = usePage<SharedData>().props;
    const [processing, setProcessing] = useState(false);
    const isAuthenticated = !!auth.user;

    const handleJoin = () => {
        setProcessing(true);
        router.post(
            `/join/${inviteLink.token}`,
            {},
            {
                onFinish: () => setProcessing(false),
            },
        );
    };

    const formatRole = (role: string) =>
        role.charAt(0).toUpperCase() + role.slice(1);

    return (
        <>
            <Head title={`Join ${inviteLink.workspace_name}`} />

            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
                <div className="mb-8 flex items-center gap-2">
                    <AppLogoIcon className="h-10 w-10" />
                </div>

                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">
                            Join {inviteLink.workspace_name}
                        </CardTitle>
                        <CardDescription>
                            You&apos;ve been invited to join this workspace via a shareable link.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center gap-3 text-sm">
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    Role: <Badge variant="outline">{formatRole(inviteLink.role)}</Badge>
                                </span>
                            </div>
                        </div>

                        {isAuthenticated ? (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleJoin}
                                disabled={processing}
                            >
                                {processing && <Spinner className="mr-2" />}
                                Join Workspace
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-center text-sm text-muted-foreground">
                                    Sign in or create an account to join this workspace.
                                </p>
                                <div className="grid gap-2">
                                    <Button className="w-full" asChild>
                                        <Link
                                            href={`/login?redirect=/join/${inviteLink.token}`}
                                        >
                                            Sign In
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        asChild
                                    >
                                        <Link
                                            href={`/register?redirect=/join/${inviteLink.token}`}
                                        >
                                            Create Account
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    If you weren&apos;t expecting this link, you can safely ignore it.
                </p>
            </div>
        </>
    );
}
