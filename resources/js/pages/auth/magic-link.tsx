import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';

export default function MagicLink({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Using standard Inertia post call, relying on Laravel named routes natively if ziggy is present,
        // or just hardcoded URL here to avoid Wayfinder sync issues during rapid prototyping.
        post('/magic-login', {
            onSuccess: () => reset('email'),
        });
    };

    return (
        <AuthLayout
            title="Sign in with Magic Link"
            description="Enter your email address and we will send you a secure link to log in instantly."
        >
            <Head title="Sign in with Magic Link" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="email@example.com"
                            value={data.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        tabIndex={2}
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Email me a login link
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground mt-4">
                    <TextLink href="/login" tabIndex={3} className="font-semibold">
                        Back to password login
                    </TextLink>
                </div>
            </form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
