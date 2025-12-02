import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2, Calendar, Mail, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface InvitationData {
    token: string;
    email: string;
    role: string;
    workspace: {
        id: number;
        name: string;
        logo: string | null;
    };
    expires_at: string;
}

interface InvitationAcceptProps {
    invitation: InvitationData;
}

export default function InvitationAccept({ invitation }: InvitationAcceptProps) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslations();
    const [processing, setProcessing] = useState(false);

    const isAuthenticated = !!auth.user;
    const emailMatches = auth.user?.email === invitation.email;

    const handleAccept = () => {
        setProcessing(true);
        router.post(`/invitations/${invitation.token}/accept`, {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const formatRole = (role: string) => role.charAt(0).toUpperCase() + role.slice(1);

    return (
        <>
            <Head title={t('invitation.page_title', 'Join Workspace')} />

            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
                <div className="mb-8 flex items-center gap-2">
                    <AppLogoIcon className="h-10 w-10" />
                </div>

                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            {invitation.workspace.logo ? (
                                <img
                                    src={invitation.workspace.logo}
                                    alt={invitation.workspace.name}
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                            ) : (
                                <Building2 className="h-8 w-8 text-primary" />
                            )}
                        </div>
                        <CardTitle className="text-2xl">
                            {t('invitation.title', "You're Invited!")}
                        </CardTitle>
                        <CardDescription>
                            {t('invitation.description', "You've been invited to join")}{' '}
                            <strong>{invitation.workspace.name}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{t('invitation.invited_email', 'Invited')}: {invitation.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                                <span>{t('invitation.role', 'Role')}: {formatRole(invitation.role)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    {t('invitation.expires', 'Expires')}: {new Date(invitation.expires_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {isAuthenticated ? (
                            emailMatches ? (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleAccept}
                                    disabled={processing}
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    {t('invitation.accept_button', 'Accept Invitation')}
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-200">
                                        <p>
                                            {t('invitation.wrong_account', "You're signed in as")}{' '}
                                            <strong>{auth.user.email}</strong>,{' '}
                                            {t('invitation.but_sent_to', 'but this invitation was sent to')}{' '}
                                            <strong>{invitation.email}</strong>.
                                        </p>
                                        <p className="mt-2">
                                            {t('invitation.sign_out_message', 'Please sign out and sign in with the correct account, or create a new account with that email.')}
                                        </p>
                                    </div>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/logout" method="post" as="button">
                                            {t('auth.sign_out', 'Sign Out')}
                                        </Link>
                                    </Button>
                                </div>
                            )
                        ) : (
                            <div className="space-y-4">
                                <p className="text-center text-sm text-muted-foreground">
                                    {t('invitation.auth_required', 'Sign in or create an account to accept this invitation.')}
                                </p>
                                <div className="grid gap-2">
                                    <Button className="w-full" asChild>
                                        <Link href={`/login?email=${encodeURIComponent(invitation.email)}&redirect=/invitations/${invitation.token}`}>
                                            {t('auth.sign_in', 'Sign In')}
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={`/register?email=${encodeURIComponent(invitation.email)}&redirect=/invitations/${invitation.token}`}>
                                            {t('auth.create_account', 'Create Account')}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    {t('invitation.ignore_message', "If you weren't expecting this invitation, you can safely ignore it.")}
                </p>
            </div>
        </>
    );
}

