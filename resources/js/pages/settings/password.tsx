import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { History } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/user-password';

interface PasswordHistoryEntry {
    id: number;
    ip_address: string | null;
    user_agent: string | null;
    changed_at: string;
}

interface PasswordProps {
    passwordHistory: PasswordHistoryEntry[];
}

export default function Password({ passwordHistory }: PasswordProps) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { t } = useTranslations();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.password.title', 'Password settings'),
            href: edit().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.password.title', 'Update password')} />

            <SettingsLayout
                title={t('settings.password.title', 'Update password')}
                description={t('settings.password.description', 'Ensure your account is using a long, random password to stay secure')}
                fullWidth
            >
                <div className="space-y-6">

                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        {t('settings.password.current_password', 'Current password')}
                                    </Label>

                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        placeholder={t('settings.password.current_password', 'Current password')}
                                    />

                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        {t('settings.password.new_password', 'New password')}
                                    </Label>

                                    <Input
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder={t('settings.password.new_password', 'New password')}
                                    />

                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        {t('settings.password.confirm_password', 'Confirm password')}
                                    </Label>

                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder={t('settings.password.confirm_password', 'Confirm password')}
                                    />

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                    >
                                        {t('settings.password.save_password', 'Save password')}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            {t('settings.profile.saved', 'Saved')}
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>

                    {passwordHistory.length > 0 && (
                        <div className="mt-8 border-t pt-6">
                            <div className="mb-4 flex items-center gap-2">
                                <History className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium">
                                    {t('settings.password.history_title', 'Password Change History')}
                                </h3>
                            </div>
                            <div className="divide-y rounded-lg border">
                                {passwordHistory.map((entry) => (
                                    <div key={entry.id} className="flex items-center justify-between px-4 py-3 text-sm">
                                        <div className="space-y-0.5">
                                            <p className="text-muted-foreground">
                                                {new Date(entry.changed_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                            {entry.ip_address && (
                                                <p className="text-xs text-muted-foreground/70">
                                                    IP: {entry.ip_address}
                                                </p>
                                            )}
                                        </div>
                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Changed
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
