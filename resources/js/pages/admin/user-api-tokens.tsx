import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, KeyRound, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface UserToken {
    id: string;
    name: string;
    last_used_at: string | null;
    created_at: string;
}

interface UserSummary {
    id: number;
    name: string;
    email: string;
}

interface UserApiTokensProps {
    user: UserSummary;
    tokens: UserToken[];
}

export default function UserApiTokens({ user, tokens }: UserApiTokensProps) {
    const { props } = usePage();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tokenToDelete, setTokenToDelete] = useState<UserToken | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const deleteForm = useForm();

    const flash = props.flash as { token?: string } | undefined;

    const createToken = (event: React.FormEvent) => {
        event.preventDefault();

        post(`/admin/users/${user.id}/api-tokens`, {
            preserveScroll: true,
            onSuccess: () => reset('name'),
        });
    };

    const confirmTokenDeletion = (token: UserToken) => {
        setTokenToDelete(token);
        setIsDeleteModalOpen(true);
    };

    const deleteToken = () => {
        if (!tokenToDelete) {
            return;
        }

        deleteForm.delete(`/admin/users/${user.id}/api-tokens/${tokenToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setTokenToDelete(null);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title={`API Tokens - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl border border-sidebar-border/70 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 text-muted-foreground"
                                onClick={() => router.get('/admin/users')}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Button>
                        </div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <KeyRound className="h-6 w-6" />
                            User API Tokens
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage API tokens for <strong>{user.name}</strong> ({user.email})
                        </p>
                    </div>
                </div>

                <form onSubmit={createToken} className="space-y-4 rounded-xl border bg-card p-4">
                    <h3 className="text-base font-semibold">Create new token</h3>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Token Name</Label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    required
                                    placeholder="E.g. CI Access"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>
                            <Button disabled={processing}>Create</Button>
                        </div>
                    </div>
                </form>

                {flash?.token && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/30">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">API Token Created</h3>
                        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                            Copy this token now. It will not be shown again.
                        </p>
                        <div className="mt-3 break-all rounded bg-gray-100 p-2 font-mono text-xs dark:bg-gray-800">
                            {flash.token}
                        </div>
                    </div>
                )}

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Active Tokens</h3>

                    {tokens.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No API tokens found for this user.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tokens.map((token) => (
                                <div
                                    key={token.id}
                                    className="flex items-center justify-between rounded-xl border bg-card p-4 text-card-foreground shadow-sm"
                                >
                                    <div>
                                        <div className="font-medium">{token.name}</div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            {token.last_used_at
                                                ? `Last used: ${new Date(token.last_used_at).toLocaleDateString()}`
                                                : 'Never used'}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
                                        onClick={() => confirmTokenDeletion(token)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Revoke
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revoke API Token</DialogTitle>
                        <DialogDescription>
                            Revoking this token will immediately block any clients using it.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={deleteToken} disabled={deleteForm.processing}>
                            Revoke Token
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
