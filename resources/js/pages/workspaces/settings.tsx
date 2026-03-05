import InputError from '@/components/input-error';
import { HelpTooltip } from '@/components/help-tooltip';
import { useTranslations } from '@/hooks/use-translations';
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
import { AlertTriangle, Building2, Download, Palette, Upload, X } from 'lucide-react';
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
    const { t } = useTranslations();
    const { data, setData, errors, processing, isDirty } = useForm({
        name: workspace.name,
        slug: workspace.slug,
        logo: null as File | null,
        remove_logo: false,
        accent_color: workspace.accent_color || '',
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

    const handleExport = () => {
        window.location.href = '/workspaces/export';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('workspace.settings.title', 'Workspace Settings')} />

            <SettingsLayout
                title={t('workspace.settings.title', 'Workspace Settings')}
                description={t('workspace.settings.description', 'Manage your workspace settings and configuration.')}
                fullWidth
            >
                <div className="space-y-6">

                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('navigation.general', 'General')}</CardTitle>
                            <CardDescription>
                                {t('workspace.settings.description', 'Manage your workspace settings and configuration.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Logo Upload */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5">
                                        {t('workspace.settings.logo', 'Logo')}
                                        <HelpTooltip content="Your workspace logo appears in the sidebar, team invitations, and exported data. Recommended size: 200×200px." />
                                    </Label>
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
                                                    {t('workspace.settings.upload_logo', 'Upload Logo')}
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
                                    <Label htmlFor="name">{t('workspace.settings.name', 'Workspace Name')}</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder={t('workspace.settings.name', 'Workspace Name')}
                                        required
                                        disabled={!isAdmin}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Slug */}
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="flex items-center gap-1.5">
                                        {t('workspace.settings.slug', 'Workspace Slug')}
                                        <HelpTooltip content="The URL-friendly identifier for your workspace. Used in links and API endpoints. Only letters, numbers, dashes, and underscores." />
                                    </Label>
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
                                            placeholder={t('workspace.create.slug_placeholder', 'my-awesome-workspace')}
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
                                        {t('workspace.settings.save', 'Save Changes')}
                                    </Button>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    {/* Plan Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('billing.current_plan', 'Current Plan')}</CardTitle>
                            <CardDescription>
                                {t('billing.your_workspace_on', 'Your workspace is on the {{plan}} plan.', { plan: workspace.plan })}
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
                                            ? t('billing.no_subscription_desc', 'Upgrade to a paid plan to unlock more features and team members.')
                                            : t('billing.thank_you', 'Thank you for being a subscriber!')}
                                    </p>
                                </div>
                                <Button variant="outline" asChild>
                                    <a href="/billing">{t('billing.manage_subscription', 'Manage Subscription')}</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Branding */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                {t('workspace.settings.branding', 'Branding')}
                            </CardTitle>
                            <CardDescription>
                                {t('workspace.settings.branding_description', 'Customize the accent color used across your workspace.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="accent_color">
                                        {t('workspace.settings.accent_color', 'Accent Color')}
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            id="accent_color"
                                            value={data.accent_color || '#6366f1'}
                                            onChange={(e) => setData('accent_color', e.target.value)}
                                            className="h-10 w-14 cursor-pointer rounded-md border p-1"
                                            disabled={!isAdmin}
                                        />
                                        <Input
                                            value={data.accent_color || ''}
                                            onChange={(e) => setData('accent_color', e.target.value)}
                                            placeholder="#6366f1"
                                            className="w-32 font-mono text-sm"
                                            maxLength={7}
                                            disabled={!isAdmin}
                                        />
                                        {data.accent_color && isAdmin && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setData('accent_color', '')}
                                            >
                                                {t('workspace.settings.reset_color', 'Reset')}
                                            </Button>
                                        )}
                                    </div>
                                    <InputError message={errors.accent_color} />
                                </div>

                                {/* Preset Colors */}
                                {isAdmin && (
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">
                                            {t('workspace.settings.preset_colors', 'Presets')}
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#64748b'].map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setData('accent_color', color)}
                                                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${data.accent_color === color ? 'border-foreground scale-110' : 'border-transparent'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Live Preview */}
                                {data.accent_color && (
                                    <div className="rounded-lg border p-4">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                                            {t('workspace.settings.preview', 'Preview')}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-8 w-8 rounded-lg"
                                                style={{ backgroundColor: data.accent_color }}
                                            />
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: data.accent_color }}>
                                                    {workspace.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {t('workspace.settings.preview_example', 'Your brand color in action')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isAdmin && (
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.put('/workspaces/settings', data, {
                                                forceFormData: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                        disabled={processing || !isDirty}
                                    >
                                        {processing && <Spinner className="mr-2" />}
                                        {t('workspace.settings.save_branding', 'Save Branding')}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('workspace.settings.data_management', 'Data Management')}</CardTitle>
                            <CardDescription>
                                {t('workspace.settings.data_management_description', 'Export your workspace data for GDPR compliance or backup.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        {t('workspace.settings.export_data', 'Export Workspace Data')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t('workspace.settings.export_description', 'Download all workspace data, members, and activity logs in JSON format.')}
                                    </p>
                                </div>
                                <Button variant="outline" onClick={handleExport}>
                                    <Download className="mr-2 h-4 w-4" />
                                    {t('workspace.settings.export_button', 'Export JSON')}
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
                                    {t('workspace.settings.danger_zone', 'Danger Zone')}
                                </CardTitle>
                                <CardDescription>
                                    {t('workspace.settings.delete_description', 'Once you delete a workspace, there is no going back. Please be certain.')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {t('workspace.settings.delete_description', 'Once you delete a workspace, there is no going back. Please be certain.')}
                                </p>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="delete-confirm">
                                            {t('workspace.settings.delete_confirm', 'Type the workspace name to confirm deletion')}
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
                                        {t('workspace.settings.delete_button', 'Delete Workspace')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {workspace.personal_workspace && (
                        <Card className="border-muted">
                            <CardContent className="py-6">
                                <p className="text-sm text-muted-foreground">
                                    {t('workspace.settings.personal_workspace', 'This is your personal workspace and cannot be deleted.')}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
