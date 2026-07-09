import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { History, Key, Lock, ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { SecuritySummaryCard } from '@/components/security-summary-card';
import { SessionSummaryCard } from '@/components/session-summary-card';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/hooks/use-translations';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import ProfileLayout from '@/layouts/settings/profile-layout';
import { type BreadcrumbItem } from '@/types';

interface PasswordHistoryEntry {
    id: number;
    ip_address: string | null;
    user_agent: string | null;
    changed_at: string;
}

interface AuthenticationProps {
    passwordHistory: PasswordHistoryEntry[];
    twoFactorEnabled: boolean;
    requiresConfirmation: boolean;
}

export default function Authentication({
    passwordHistory,
    twoFactorEnabled,
    requiresConfirmation,
}: AuthenticationProps) {
    const { t } = useTranslations();
    const passwordInput = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [showSetupModal, setShowSetupModal] = useState(false);
    const {
        recoveryCodesList,
        fetchRecoveryCodes,
        hasSetupData,
        clearSetupData,
        fetchSetupData,
        qrCodeSvg,
        manualSetupKey,
        errors: twoFactorErrors,
    } = useTwoFactorAuth();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.security.authentication', 'Authentication'),
            href: '/settings/security/authentication',
        },
    ];

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordInput.put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => passwordInput.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={t('settings.security.authentication', 'Authentication')}
            />

            <ProfileLayout
                title={t('settings.security.authentication', 'Authentication')}
                description={t(
                    'settings.security.authentication_description',
                    'Manage your password and two-factor authentication settings.',
                )}
                fullWidth
            >
                <div className="space-y-8">
                    {/* Security Summary */}
                    <SecuritySummaryCard />

                    {/* Session Summary */}
                    <SessionSummaryCard />

                    {/* Password Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>
                                    {t('settings.password.title', 'Password')}
                                </CardTitle>
                            </div>
                            <CardDescription>
                                {t(
                                    'settings.password.description',
                                    'Ensure your account is using a long, random password to stay secure.',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submitPassword}
                                className="space-y-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        {t(
                                            'settings.password.current_password',
                                            'Current password',
                                        )}
                                    </Label>
                                    <Input
                                        id="current_password"
                                        type="password"
                                        value={
                                            passwordInput.data.current_password
                                        }
                                        onChange={(e) =>
                                            passwordInput.setData(
                                                'current_password',
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="current-password"
                                    />
                                    <InputError
                                        message={
                                            passwordInput.errors
                                                .current_password
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        {t(
                                            'settings.password.new_password',
                                            'New password',
                                        )}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={passwordInput.data.password}
                                        onChange={(e) =>
                                            passwordInput.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                    />
                                    <InputError
                                        message={passwordInput.errors.password}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        {t(
                                            'settings.password.confirm_password',
                                            'Confirm password',
                                        )}
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={
                                            passwordInput.data
                                                .password_confirmation
                                        }
                                        onChange={(e) =>
                                            passwordInput.setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                    />
                                    <InputError
                                        message={
                                            passwordInput.errors
                                                .password_confirmation
                                        }
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        type="submit"
                                        disabled={passwordInput.processing}
                                    >
                                        {t(
                                            'settings.password.save_password',
                                            'Save password',
                                        )}
                                    </Button>
                                    <Transition
                                        show={passwordInput.recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                'settings.profile.saved',
                                                'Saved',
                                            )}
                                        </p>
                                    </Transition>
                                </div>
                            </form>

                            {/* Password History */}
                            {passwordHistory.length > 0 && (
                                <>
                                    <Separator className="my-6" />
                                    <div className="mb-4 flex items-center gap-2">
                                        <History className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="text-sm font-medium">
                                            {t(
                                                'settings.password.history_title',
                                                'Password Change History',
                                            )}
                                        </h3>
                                    </div>
                                    <div className="divide-y rounded-lg border">
                                        {passwordHistory
                                            .slice(0, 5)
                                            .map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="flex items-center justify-between px-4 py-3 text-sm"
                                                >
                                                    <div className="space-y-0.5">
                                                        <p className="text-muted-foreground">
                                                            {new Date(
                                                                entry.changed_at,
                                                            ).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                },
                                                            )}
                                                        </p>
                                                        {entry.ip_address && (
                                                            <p className="text-xs text-muted-foreground/70">
                                                                IP:{' '}
                                                                {
                                                                    entry.ip_address
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Changed
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Two-Factor Authentication Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>
                                    {t(
                                        'settings.two_factor.title',
                                        'Two-Factor Authentication',
                                    )}
                                </CardTitle>
                            </div>
                            <CardDescription>
                                {t(
                                    'settings.two_factor.description',
                                    'Add an extra layer of security to your account.',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Status
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {twoFactorEnabled
                                                ? t(
                                                      'settings.two_factor.enabled_description',
                                                      'Your account is protected with 2FA.',
                                                  )
                                                : t(
                                                      'settings.two_factor.disabled_description',
                                                      'Enable 2FA for enhanced security.',
                                                  )}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            twoFactorEnabled
                                                ? 'default'
                                                : 'destructive'
                                        }
                                    >
                                        {twoFactorEnabled
                                            ? t(
                                                  'settings.two_factor.enabled',
                                                  'Enabled',
                                              )
                                            : t(
                                                  'settings.two_factor.disabled',
                                                  'Disabled',
                                              )}
                                    </Badge>
                                </div>

                                {twoFactorEnabled ? (
                                    <div className="space-y-4">
                                        <TwoFactorRecoveryCodes
                                            recoveryCodesList={
                                                recoveryCodesList
                                            }
                                            fetchRecoveryCodes={
                                                fetchRecoveryCodes
                                            }
                                            errors={twoFactorErrors}
                                        />
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                // Disable 2FA via Fortify route
                                                window.axios
                                                    .delete(
                                                        '/user/two-factor-authentication',
                                                    )
                                                    .then(() =>
                                                        window.location.reload(),
                                                    );
                                            }}
                                        >
                                            <Button
                                                variant="destructive"
                                                type="submit"
                                            >
                                                <ShieldBan className="mr-2 h-4 w-4" />
                                                {t(
                                                    'settings.two_factor.disable_2fa',
                                                    'Disable 2FA',
                                                )}
                                            </Button>
                                        </form>
                                    </div>
                                ) : (
                                    <div>
                                        {hasSetupData ? (
                                            <Button
                                                onClick={() =>
                                                    setShowSetupModal(true)
                                                }
                                            >
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                {t(
                                                    'settings.two_factor.continue_setup',
                                                    'Continue Setup',
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    // Enable 2FA via Fortify route
                                                    window.axios
                                                        .post(
                                                            '/user/two-factor-authentication',
                                                        )
                                                        .then(() => {
                                                            fetchSetupData();
                                                            setShowSetupModal(
                                                                true,
                                                            );
                                                        });
                                                }}
                                            >
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                {t(
                                                    'settings.two_factor.enable_2fa',
                                                    'Enable 2FA',
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => {
                            setShowSetupModal(false);
                            clearSetupData();
                        }}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={twoFactorErrors}
                    />
                </div>
            </ProfileLayout>
        </AppLayout>
    );
}
