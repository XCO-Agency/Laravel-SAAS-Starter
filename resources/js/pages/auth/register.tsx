import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { useTranslations } from '@/hooks/use-translations';

interface RegisterProps {
    email?: string;
    redirect?: string;
}

export default function Register({ email, redirect }: RegisterProps) {
    const { t } = useTranslations();

    // Build login URL with email and redirect params if present
    const loginUrl = () => {
        const baseUrl = login();
        const params = new URLSearchParams();
        if (email) params.set('email', email);
        if (redirect) params.set('redirect', redirect);
        return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    };

    return (
        <AuthLayout
            title={t('auth.register.title', 'Create an account')}
            description={t('auth.register.description', 'Enter your details below to create your account')}
        >
            <Head title={t('auth.register.page_title', 'Register')} />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('auth.name', 'Name')}</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder={t('auth.name_placeholder', 'Full name')}
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('auth.email', 'Email address')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    defaultValue={email}
                                    readOnly={!!email}
                                    className={email ? 'bg-muted' : ''}
                                />
                                <InputError message={errors.email} />
                                {email && (
                                    <p className="text-xs text-muted-foreground">
                                        {t('auth.register.email_from_invitation', 'This email is from your invitation and cannot be changed.')}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">{t('auth.password', 'Password')}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder={t('auth.password', 'Password')}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {t('auth.confirm_password', 'Confirm password')}
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder={t('auth.confirm_password', 'Confirm password')}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                {t('auth.register.button', 'Create account')}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            {t('auth.have_account', 'Already have an account?')}{' '}
                            <TextLink href={loginUrl()} tabIndex={6}>
                                {t('auth.log_in', 'Log in')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
