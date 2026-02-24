import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface Token {
    id: string;
    name: string;
    last_used_at: string | null;
    created_at: string;
}

export default function ApiTokens({ tokens }: { tokens: Token[] }) {
    const { t } = useTranslations();
    const { props } = usePage();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tokenToDelete, setTokenToDelete] = useState<Token | null>(null);
    const deleteForm = useForm();

    const createToken = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/api-tokens', {
            preserveScroll: true,
            onSuccess: () => reset('name'),
        });
    };

    const confirmTokenDeletion = (token: Token) => {
        setTokenToDelete(token);
        setIsDeleteModalOpen(true);
    };

    const deleteToken = () => {
        if (!tokenToDelete) return;

        deleteForm.delete(`/settings/api-tokens/${tokenToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setTokenToDelete(null);
            },
        });
    };

    const flash = props.flash as { token?: string } | undefined;

    return (
        <AppLayout breadcrumbs={[{ title: t('settings.api_tokens', 'API Tokens'), href: '/settings/api-tokens' }]}>
            <Head title={t('settings.api_tokens', 'API Tokens')} />

            <SettingsLayout
                title={t('settings.api_tokens', 'API Tokens')}
                description={t('settings.api_tokens.description', 'Manage personal access tokens for API access.')}
                fullWidth
            >
                <div className="space-y-6">
                    <form onSubmit={createToken} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('settings.api_tokens.create.name', 'Token Name')}</Label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        placeholder={t('settings.api_tokens.create.placeholder', 'E.g. GitHub Actions')}
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>
                                <Button disabled={processing} className="mt-1">
                                    {t('settings.api_tokens.create.button', 'Create')}
                                </Button>
                            </div>
                        </div>
                    </form>

                    {flash?.token && (
                        <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                        {t('settings.api_tokens.success.title', 'API Token Created')}
                                    </h3>
                                    <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                        <p>
                                            {t(
                                                'settings.api_tokens.success.message',
                                                'Please copy your new API token. For your security, it will NOT be shown again.'
                                            )}
                                        </p>
                                        <div className="mt-3 flex items-center rounded bg-gray-100 dark:bg-gray-800 p-2 font-mono text-xs break-all">
                                            {flash.token}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tokens.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">{t('settings.api_tokens.manage.title', 'Active Tokens')}</h3>
                                <div className="space-y-3">
                                    {tokens.map((token) => (
                                        <div key={token.id} className="flex items-center justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                                            <div>
                                                <div className="font-medium">{token.name}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {token.last_used_at
                                                        ? t('settings.api_tokens.manage.last_used', 'Last used: ' + new Date(token.last_used_at).toLocaleDateString())
                                                        : t('settings.api_tokens.manage.never_used', 'Never used')}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                onClick={() => confirmTokenDeletion(token)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                {t('settings.api_tokens.manage.delete', 'Revoke')}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('settings.api_tokens.delete_modal.title', 'Revoke API Token')}</DialogTitle>
                            <DialogDescription>
                                {t(
                                    'settings.api_tokens.delete_modal.description',
                                    'Are you sure you would like to revoke this API token? Any applications or scripts using this token will no longer be able to access the API.'
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                                {t('global.cancel', 'Cancel')}
                            </Button>
                            <Button variant="destructive" onClick={deleteToken} disabled={deleteForm.processing}>
                                {t('settings.api_tokens.delete_modal.button', 'Revoke Token')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SettingsLayout>
        </AppLayout>
    );
}
