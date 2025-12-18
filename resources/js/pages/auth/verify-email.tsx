// Components
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@inertiajs/react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslations();

    return (
        <AuthLayout
            title={t('auth.verify_email.title', 'Verify Your Email Address')}
            description={t('auth.verify_email.description', 'Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn\'t receive the email, we will gladly send you another.')}
        >
            <Head title={t('auth.verify_email.page_title', 'Email verification')} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {t('auth.verify_email.link_sent', 'A new verification link has been sent to the email address you provided during registration.')}
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="default" size="lg" className="w-full">
                            {processing && <Spinner />}
                            {t('auth.verify_email.button', 'Resend Verification Email')}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm font-semibold"
                        >
                            {t('auth.sign_out', 'Sign Out')}
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
