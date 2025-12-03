import InputError from '@/components/input-error';
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
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import {
    type BreadcrumbItem,
    type Workspace,
    type WorkspaceRole,
} from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertTriangle, Building2, Upload, X } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';

interface WorkspaceSettingsProps {
    workspace: Workspace;
    userRole: WorkspaceRole;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Workspace Settings', href: '/workspaces/settings' },
];

export default function WorkspaceSettings({
    workspace,
    userRole,
}: WorkspaceSettingsProps) {
    const { data, setData, errors, processing, isDirty } = useForm({
        name: workspace.name,
        slug: workspace.slug,
        logo: null as File | null,
        remove_logo: false,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(
        workspace.logo_url,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deleteConfirm, setDeleteConfirm] = useState('');

    const isAdmin = userRole === 'owner' || userRole === 'admin';
    const isOwner = userRole === 'owner';

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setData('remove_logo', false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setData('logo', null);
        setData('remove_logo', true);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put('/workspaces/settings', data, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (deleteConfirm === workspace.name) {
            router.delete('/workspaces');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workspace Settings" />

            <SettingsLayout
                title="Workspace Settings"
                description="Manage your workspace settings and configuration."
                fullWidth
            >
                <div className="space-y-6">

                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>General</CardTitle>
                            <CardDescription>
                                Basic information about your workspace.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Logo Upload */}
                                <div className="space-y-2">
                                    <Label>Workspace Logo</Label>
                                    <div className="flex items-center gap-4">
                                        {logoPreview ? (
                                            <div className="relative">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    className="h-20 w-20 rounded-lg object-cover"
                                                />
                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={removeLogo}
                                                        className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed">
                                                <Building2 className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        {isAdmin && (
                                            <div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoChange}
                                                    className="hidden"
                                                    id="logo-upload"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload Logo
                                                </Button>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    PNG, JPG, GIF up to 2MB
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.logo} />
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Workspace Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="My Awesome Workspace"
                                        required
                                        disabled={!isAdmin}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Slug */}
                                <div className="space-y-2">
                                    <Label htmlFor="slug">URL Slug</Label>
                                    <div className="flex items-center">
                                        <span className="rounded-l-md border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground">
                                            /
                                        </span>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) =>
                                                setData('slug', e.target.value)
                                            }
                                            placeholder="my-awesome-workspace"
                                            className="rounded-l-none"
                                            disabled={!isAdmin}
                                        />
                                    </div>
                                    <InputError message={errors.slug} />
                                </div>

                                {isAdmin && (
                                    <Button
                                        type="submit"
                                        disabled={processing || !isDirty}
                                    >
                                        {processing && (
                                            <Spinner className="mr-2" />
                                        )}
                                        Save Changes
                                    </Button>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    {/* Plan Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>
                                Your workspace is on the {workspace.plan} plan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">
                                        {workspace.plan}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {workspace.plan === 'Free'
                                            ? 'Upgrade to unlock more features'
                                            : 'Thank you for being a subscriber!'}
                                    </p>
                                </div>
                                <Button variant="outline" asChild>
                                    <a href="/billing">Manage Billing</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    {isOwner && !workspace.personal_workspace && (
                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="h-5 w-5" />
                                    Danger Zone
                                </CardTitle>
                                <CardDescription>
                                    Permanently delete this workspace and all of
                                    its data.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Once you delete a workspace, there is no
                                    going back. All data, team members, and
                                    configurations will be permanently removed.
                                </p>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="delete-confirm">
                                            Type{' '}
                                            <strong>{workspace.name}</strong> to
                                            confirm
                                        </Label>
                                        <Input
                                            id="delete-confirm"
                                            value={deleteConfirm}
                                            onChange={(e) =>
                                                setDeleteConfirm(e.target.value)
                                            }
                                            placeholder={workspace.name}
                                        />
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={
                                            deleteConfirm !== workspace.name
                                        }
                                    >
                                        Delete Workspace
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {workspace.personal_workspace && (
                        <Card className="border-muted">
                            <CardContent className="py-6">
                                <p className="text-sm text-muted-foreground">
                                    This is your personal workspace and cannot
                                    be deleted.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
