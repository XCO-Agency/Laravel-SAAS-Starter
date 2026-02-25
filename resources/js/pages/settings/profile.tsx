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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

                                <div className="grid gap-2">
                                    <Label htmlFor="bio">{t('settings.profile.bio', 'Bio')}</Label>

                                    <Textarea
                                        id="bio"
                                        className="mt-1 block w-full resize-none"
                                        defaultValue={auth.user.bio || ''}
                                        name="bio"
                                        rows={4}
                                        placeholder={t('settings.profile.bio_placeholder', 'Tell us a little about yourself...')}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.bio}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t('settings.profile.bio_help', 'Brief description up to 1000 characters.')}
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="timezone">{t('settings.profile.timezone', 'Timezone')}</Label>

                                    <input type="hidden" name="timezone" id="timezone" defaultValue={auth.user.timezone || 'UTC'} />

                                    <Select
                                        defaultValue={auth.user.timezone || 'UTC'}
                                        onValueChange={(val) => {
                                            const el = document.getElementById('timezone') as HTMLInputElement;
                                            if (el) el.value = val;
                                        }}
                                        name="timezone_select"
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC (Universal Coordinated Time)</SelectItem>
                                            <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                                            <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                                            <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                                            <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                                            <SelectItem value="Europe/London">London</SelectItem>
                                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                                            <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <InputError
                                        className="mt-2"
                                        message={errors.timezone}
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
                                        show={!!recentlySuccessful}
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
