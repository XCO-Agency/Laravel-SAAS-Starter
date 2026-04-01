import AvatarUpload from '@/components/avatar-upload';
import { CustomFieldsManager } from '@/components/custom-fields/CustomFieldsManager';
import { HelpTooltip } from '@/components/help-tooltip';
import InputError from '@/components/input-error';
import { TagManager } from '@/components/tags/TagManager';
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
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import WorkspaceLayout from '@/layouts/settings/workspace-layout';
import {
    destroy as destroyLogo,
    update as updateLogo,
} from '@/routes/workspaces/logo';
import {
    type BreadcrumbItem,
    type CustomField,
    type Tag as TagType,
    type Workspace,
    type WorkspaceRole,
} from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    Circle,
    Crown,
    Download,
    Key,
    Palette,
    Plus,
    Save,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface OnboardingStep {
    key: string;
    label: string;
    completed: boolean;
}

interface WorkspaceSettingsProps {
    workspace: Workspace & { created_at: string };
    userRole: WorkspaceRole;
    stats: {
        members_count: number;
        api_keys_count: number;
    };
    onboardingProgress: {
        score: number;
        steps: OnboardingStep[];
    };
    tags?: TagType[];
    customFields?: CustomField[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Workspace Settings', href: '/workspaces/settings' },
];

export default function WorkspaceSettings({
    workspace,
    userRole,
    stats,
    onboardingProgress,
    tags = [],
    customFields = [],
}: WorkspaceSettingsProps) {
    const { t } = useTranslations();
    const { data, setData, errors, processing, isDirty } = useForm({
        name: workspace.name,
        slug: workspace.slug,
        logo: null as File | null,
        remove_logo: false,
        accent_color: workspace.accent_color || '',
        billing_email: workspace.billing_email || '',
    });

    // No longer needed as handled by AvatarUpload sub-requests
    const [deleteConfirm, setDeleteConfirm] = useState('');

    const isAdmin = userRole === 'owner' || userRole === 'admin';
    const isOwner = userRole === 'owner';

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

            <WorkspaceLayout
                title={t('workspace.settings.title', 'Workspace Settings')}
                description={t(
                    'workspace.settings.description',
                    'Manage your workspace settings and configuration.',
                )}
                fullWidth
            >
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                            <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    {t(
                                        'workspace.settings.stats_members',
                                        'Members',
                                    )}
                                </p>
                                <p className="text-sm font-semibold">
                                    {stats.members_count}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                            <Crown className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    {t('workspace.settings.stats_plan', 'Plan')}
                                </p>
                                <p className="truncate text-sm font-semibold">
                                    {workspace.plan}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    {t(
                                        'workspace.settings.stats_created',
                                        'Created',
                                    )}
                                </p>
                                <p className="text-sm font-semibold">
                                    {new Date(
                                        workspace.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                            <Key className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    {t(
                                        'workspace.settings.stats_api_keys',
                                        'API Keys',
                                    )}
                                </p>
                                <p className="text-sm font-semibold">
                                    {stats.api_keys_count}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Workspace Onboarding Progress */}
                    {onboardingProgress.score < 100 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">
                                        Workspace Setup Progress
                                    </CardTitle>
                                    <span className="text-sm font-semibold text-primary">
                                        {onboardingProgress.score}%
                                    </span>
                                </div>
                                <Progress
                                    value={onboardingProgress.score}
                                    className="h-2"
                                />
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid gap-1.5 sm:grid-cols-2">
                                    {onboardingProgress.steps.map((step) => (
                                        <div
                                            key={step.key}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            {step.completed ? (
                                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                            ) : (
                                                <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                                            )}
                                            <span
                                                className={
                                                    step.completed
                                                        ? 'text-muted-foreground line-through'
                                                        : ''
                                                }
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('navigation.general', 'General')}
                            </CardTitle>
                            <CardDescription>
                                {t(
                                    'workspace.settings.description',
                                    'Manage your workspace settings and configuration.',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <AvatarUpload
                                        currentUrl={workspace.logo_url}
                                        uploadUrl={updateLogo().url}
                                        deleteUrl={destroyLogo().url}
                                        onSuccess={() => {
                                            router.reload({
                                                only: ['workspace'],
                                            });
                                        }}
                                        label={t(
                                            'workspace.settings.logo',
                                            'Logo',
                                        )}
                                        description={t(
                                            'workspace.settings.logo_description',
                                            'Your workspace logo appears in the sidebar, team invitations, and exported data. Recommended size: 200×200px.',
                                        )}
                                        fieldName="image"
                                    />
                                    <InputError message={errors.logo} />
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        {t(
                                            'workspace.settings.name',
                                            'Workspace Name',
                                        )}
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder={t(
                                            'workspace.settings.name',
                                            'Workspace Name',
                                        )}
                                        required
                                        disabled={!isAdmin}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Slug */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="slug"
                                        className="flex items-center gap-1.5"
                                    >
                                        {t(
                                            'workspace.settings.slug',
                                            'Workspace Slug',
                                        )}
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
                                            placeholder={t(
                                                'workspace.create.slug_placeholder',
                                                'my-awesome-workspace',
                                            )}
                                            className="rounded-l-none"
                                            disabled={!isAdmin}
                                        />
                                    </div>
                                    <InputError message={errors.slug} />
                                    {data.slug !== workspace.slug && (
                                        <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                            Changing the slug will break any
                                            existing links to this workspace.
                                        </p>
                                    )}
                                </div>

                                {isAdmin && (
                                    <Button
                                        type="submit"
                                        disabled={processing || !isDirty}
                                        className={!isDirty ? 'opacity-50' : ''}
                                    >
                                        {processing && (
                                            <Spinner className="mr-2" />
                                        )}
                                        {t(
                                            'workspace.settings.save',
                                            'Save Changes',
                                        )}
                                    </Button>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    {/* Plan Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('billing.current_plan', 'Current Plan')}
                            </CardTitle>
                            <CardDescription>
                                {t(
                                    'billing.your_workspace_on',
                                    'Your workspace is on the {{plan}} plan.',
                                    { plan: workspace.plan },
                                )}
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
                                            ? t(
                                                  'billing.no_subscription_desc',
                                                  'Upgrade to a paid plan to unlock more features and team members.',
                                              )
                                            : t(
                                                  'billing.thank_you',
                                                  'Thank you for being a subscriber!',
                                              )}
                                    </p>
                                </div>
                                <Button variant="outline" asChild>
                                    <a href="/billing">
                                        {t(
                                            'billing.manage_subscription',
                                            'Manage Subscription',
                                        )}
                                    </a>
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
                                {t(
                                    'workspace.settings.branding_description',
                                    'Customize the accent color used across your workspace.',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="accent_color">
                                        {t(
                                            'workspace.settings.accent_color',
                                            'Accent Color',
                                        )}
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            id="accent_color"
                                            value={
                                                data.accent_color || '#6366f1'
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'accent_color',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-10 w-14 cursor-pointer rounded-md border p-1"
                                            disabled={!isAdmin}
                                        />
                                        <Input
                                            value={data.accent_color || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'accent_color',
                                                    e.target.value,
                                                )
                                            }
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
                                                onClick={() =>
                                                    setData('accent_color', '')
                                                }
                                            >
                                                {t(
                                                    'workspace.settings.reset_color',
                                                    'Reset',
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                    <InputError message={errors.accent_color} />
                                </div>

                                {/* Preset Colors */}
                                {isAdmin && (
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">
                                            {t(
                                                'workspace.settings.preset_colors',
                                                'Presets',
                                            )}
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                '#6366f1',
                                                '#8b5cf6',
                                                '#ec4899',
                                                '#ef4444',
                                                '#f97316',
                                                '#eab308',
                                                '#22c55e',
                                                '#06b6d4',
                                                '#3b82f6',
                                                '#64748b',
                                            ].map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() =>
                                                        setData(
                                                            'accent_color',
                                                            color,
                                                        )
                                                    }
                                                    className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                                                        data.accent_color ===
                                                        color
                                                            ? 'scale-110 border-foreground shadow-md ring-2 ring-primary ring-offset-2'
                                                            : 'border-transparent hover:border-foreground/50'
                                                    }`}
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
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
                                            {t(
                                                'workspace.settings.preview',
                                                'Preview',
                                            )}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-8 w-8 rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        data.accent_color,
                                                }}
                                            />
                                            <div>
                                                <p
                                                    className="text-sm font-medium"
                                                    style={{
                                                        color: data.accent_color,
                                                    }}
                                                >
                                                    {workspace.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {t(
                                                        'workspace.settings.preview_example',
                                                        'Your brand color in action',
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isAdmin && (
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.put(
                                                '/workspaces/settings',
                                                data,
                                                {
                                                    forceFormData: true,
                                                    preserveScroll: true,
                                                },
                                            );
                                        }}
                                        disabled={processing || !isDirty}
                                        className={!isDirty ? 'opacity-50' : ''}
                                    >
                                        {processing && (
                                            <Spinner className="mr-2" />
                                        )}
                                        {t(
                                            'workspace.settings.save_branding',
                                            'Save Branding',
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <TagManager
                        workspaceId={workspace.id}
                        tags={tags}
                        isAdmin={isAdmin}
                    />

                    {/* Custom Fields */}
                    {isAdmin && (
                        <CustomFieldsManager
                            workspaceId={workspace.id}
                            fields={customFields}
                            isAdmin={isAdmin}
                        />
                    )}

                    {/* Save as Template */}
                    {isOwner && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Save className="h-5 w-5" />
                                    Workspace Template
                                </CardTitle>
                                <CardDescription>
                                    Save this workspace configuration as a
                                    reusable template.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Save as Template
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Create a template from this
                                            workspace to quickly set up similar
                                            workspaces.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            router.visit(
                                                '/workspace-templates/create',
                                            )
                                        }
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Template
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Billing Email */}
                    {isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t(
                                        'workspace.settings.billing_email',
                                        'Billing Email',
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        'workspace.settings.billing_email_desc',
                                        "Override the email address for billing receipts and invoices. Leave blank to use the workspace owner's email.",
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_email">
                                            {t(
                                                'workspace.settings.billing_email_label',
                                                'Billing Email Address',
                                            )}
                                        </Label>
                                        <Input
                                            id="billing_email"
                                            type="email"
                                            value={data.billing_email}
                                            onChange={(e) =>
                                                setData(
                                                    'billing_email',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={t(
                                                'workspace.settings.billing_email_placeholder',
                                                'billing@yourcompany.com',
                                            )}
                                            disabled={!isAdmin}
                                        />
                                        <InputError
                                            message={errors.billing_email}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t(
                                                'workspace.settings.billing_email_help',
                                                "This email will receive invoices and payment notifications instead of the owner's email.",
                                            )}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.put(
                                                '/workspaces/settings',
                                                data,
                                                {
                                                    forceFormData: true,
                                                    preserveScroll: true,
                                                },
                                            );
                                        }}
                                        disabled={processing || !isDirty}
                                    >
                                        {processing && (
                                            <Spinner className="mr-2" />
                                        )}
                                        {t(
                                            'workspace.settings.save_billing',
                                            'Save Billing Settings',
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Data Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t(
                                    'workspace.settings.data_management',
                                    'Data Management',
                                )}
                            </CardTitle>
                            <CardDescription>
                                {t(
                                    'workspace.settings.data_management_description',
                                    'Export your workspace data for GDPR compliance or backup.',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        {t(
                                            'workspace.settings.export_data',
                                            'Export Workspace Data',
                                        )}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t(
                                            'workspace.settings.export_description',
                                            'Download all workspace data, members, and activity logs in JSON format.',
                                        )}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleExport}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    {t(
                                        'workspace.settings.export_button',
                                        'Export JSON',
                                    )}
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
                                    {t(
                                        'workspace.settings.danger_zone',
                                        'Danger Zone',
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        'workspace.settings.delete_description',
                                        'Once you delete a workspace, there is no going back. Please be certain.',
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {t(
                                        'workspace.settings.delete_description',
                                        'Once you delete a workspace, there is no going back. Please be certain.',
                                    )}
                                </p>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="delete-confirm">
                                            {t(
                                                'workspace.settings.delete_confirm',
                                                'Type the workspace name to confirm deletion',
                                            )}
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
                                        {t(
                                            'workspace.settings.delete_button',
                                            'Delete Workspace',
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {workspace.personal_workspace && (
                        <Card className="border-muted">
                            <CardContent className="py-6">
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'workspace.settings.personal_workspace',
                                        'This is your personal workspace and cannot be deleted.',
                                    )}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </WorkspaceLayout>
        </AppLayout>
    );
}
