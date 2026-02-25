import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import ExportData from '@/components/export-data';
import { LanguageSwitcher } from '@/components/language-switcher';
import InputError from '@/components/input-error';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Camera, X } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth, locale } = usePage<SharedData>().props;
    const { t } = useTranslations();
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(auth.user.avatar_url || auth.user.avatar || null);
    const [removeAvatar, setRemoveAvatar] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.profile.title', 'Profile settings'), // Using existing title key or similar
            href: edit().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.profile.title', 'Profile information')} />

            <SettingsLayout
                title={t('settings.profile.title', 'Profile information')}
                description={t('settings.profile.description', 'Update your name and email address')}
                fullWidth
            >
                <div className="space-y-6">

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                {removeAvatar && <input type="hidden" name="remove_avatar" value="true" />}
                                <div className="space-y-2">
                                    <Label>{t('settings.profile.avatar', 'Profile Photo')}</Label>
                                    <div className="flex items-center gap-4">
                                        {avatarPreview ? (
                                            <div className="relative">
                                                <Avatar className="h-20 w-20 overflow-hidden rounded-full">
                                                    <AvatarImage src={avatarPreview} alt={auth.user.name} />
                                                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                        {getInitials(auth.user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setRemoveAvatar(true);
                                                        setAvatarPreview(null);
                                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                                    }}
                                                    className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:opacity-90"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Avatar className="h-20 w-20 overflow-hidden rounded-full">
                                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white text-lg">
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                name="avatar"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setRemoveAvatar(false);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setAvatarPreview(reader.result as string);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={processing}
                                            >
                                                <Camera className="mr-2 h-4 w-4" />
                                                {t('settings.profile.upload_avatar', 'Upload Photo')}
                                            </Button>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                JPG, JPEG, PNG up to 2MB
                                            </p>
                                        </div>
                                    </div>
                                    <InputError message={errors.avatar} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">{t('settings.profile.name', 'Name')}</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder={t('settings.profile.name', 'Name')}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">{t('settings.profile.email', 'Email address')}</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder={t('settings.profile.email', 'Email address')}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                {t('settings.profile.email_unverified', 'Your email address is unverified.')}{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    {t('settings.profile.resend_verification', 'Click here to resend the verification email.')}
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        {t('settings.profile.verification_sent', 'A new verification link has been sent to your email address.')}
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        {t('settings.profile.save', 'Save')}
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

                    <Separator />

                    <LanguageSwitcher currentLocale={locale || auth.user?.locale || 'en'} />
                </div>

                <ExportData />
                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
