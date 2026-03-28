import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { type BreadcrumbItem, type WorkspaceTemplate } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Copy,
    Globe,
    LayoutGrid,
    Code,
    Megaphone,
    TrendingUp,
    Headphones,
    Folder,
    Kanban,
    Check,
    Trash2,
    User,
    Clock,
    Play,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ShowTemplateProps {
    template: WorkspaceTemplate;
    canEdit: boolean;
    canDelete: boolean;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    project_management: Kanban,
    development: Code,
    marketing: Megaphone,
    sales: TrendingUp,
    support: Headphones,
    other: Folder,
};

const CATEGORY_COLORS: Record<string, string> = {
    project_management: 'bg-emerald-500',
    development: 'bg-blue-500',
    marketing: 'bg-amber-500',
    sales: 'bg-violet-500',
    support: 'bg-cyan-500',
    other: 'bg-slate-500',
};

const CATEGORY_LABELS: Record<string, string> = {
    project_management: 'Project Management',
    development: 'Development',
    marketing: 'Marketing',
    sales: 'Sales',
    support: 'Support',
    other: 'Other',
};

export default function ShowWorkspaceTemplate({ template, canEdit, canDelete }: ShowTemplateProps) {
    const [isUsing, setIsUsing] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);

    const CategoryIcon = CATEGORY_ICONS[template.category] || Folder;
    const categoryColor = CATEGORY_COLORS[template.category] || 'bg-slate-500';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Templates', href: '/workspace-templates' },
        { title: template.name, href: '#' },
    ];

    const handleUse = () => {
        setIsUsing(true);
        router.post(`/workspace-templates/${template.id}/use`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsUsing(false);
                setShowSuccess('Workspace created from template!');
                setTimeout(() => router.visit('/dashboard'), 1500);
            },
            onError: () => setIsUsing(false),
        });
    };

    const handleDuplicate = () => {
        setIsDuplicating(true);
        router.post(`/workspace-templates/${template.id}/duplicate`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDuplicating(false);
                setShowSuccess('Template duplicated!');
                setTimeout(() => setShowSuccess(null), 3000);
            },
            onError: () => setIsDuplicating(false),
        });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/workspace-templates/${template.id}`, {
            onSuccess: () => router.visit('/workspace-templates'),
            onError: () => setIsDeleting(false),
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={template.name} />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                {/* Success Banner */}
                {showSuccess && (
                    <div className="border-b-2 border-emerald-500 bg-emerald-500 px-6 py-3 text-center">
                        <p className="font-mono text-sm font-bold text-white">{showSuccess}</p>
                    </div>
                )}

                {/* Header */}
                <header className={`border-b-4 bg-white dark:bg-slate-900 ${categoryColor.replace('bg-', 'border-')}`}>
                    <div className="container mx-auto px-6 py-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/workspace-templates')}
                            className="mb-4 -ml-2 font-mono text-xs uppercase text-slate-500 hover:text-slate-900"
                        >
                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                            Back to Templates
                        </Button>

                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`flex h-16 w-16 shrink-0 items-center justify-center ${categoryColor} text-white`}>
                                    <CategoryIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="font-mono text-2xl font-black uppercase tracking-tight">
                                            {template.name}
                                        </h1>
                                        {template.is_public && (
                                            <span className="inline-flex items-center gap-1 border border-slate-200 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide dark:border-slate-700">
                                                <Globe className="h-3 w-3" />
                                                Public
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 font-mono text-xs text-slate-500">
                                        by {template.creator?.name || 'Unknown'} · {CATEGORY_LABELS[template.category]}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {canDelete && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="border-2 border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-900"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container mx-auto px-6 py-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Description */}
                            {template.description && (
                                <section className="border-2 border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                                    <h2 className="mb-4 font-mono text-xs uppercase tracking-wide text-slate-500">
                                        Description
                                    </h2>
                                    <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                        {template.description}
                                    </p>
                                </section>
                            )}

                            {/* Configuration */}
                            <section className="border-2 border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                                <h2 className="mb-4 font-mono text-xs uppercase tracking-wide text-slate-500">
                                    Template Configuration
                                </h2>
                                <ul className="space-y-3 font-mono text-sm">
                                    {[
                                        { label: 'Workspace Settings', value: 'Basic configuration' },
                                        { label: 'Custom Fields', value: `${template.configuration?.custom_fields?.length || 0} fields` },
                                        { label: 'Tags', value: `${template.configuration?.tags?.length || 0} tags` },
                                        { label: 'Branding', value: template.configuration?.branding?.accent_color || 'Default' },
                                        { label: 'Webhooks', value: `${template.configuration?.webhooks?.length || 0} configured` },
                                    ].map((item) => (
                                        <li key={item.label} className="flex items-center gap-3">
                                            <span className={`h-2 w-2 ${categoryColor}`} />
                                            <span className="font-medium">{item.label}</span>
                                            <span className="text-slate-500">— {item.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Actions */}
                            <section className="border-2 border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                                <h2 className="mb-4 font-mono text-xs uppercase tracking-wide text-slate-500">
                                    Actions
                                </h2>
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleUse}
                                        disabled={isUsing}
                                        className="w-full border-2 border-slate-900 bg-violet-500 font-mono text-xs uppercase tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-violet-600 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        {isUsing && <Spinner className="mr-2" />}
                                        <Play className="mr-2 h-4 w-4" />
                                        Use Template
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleDuplicate}
                                        disabled={isDuplicating}
                                        className="w-full border-2 border-slate-200 font-mono text-xs uppercase hover:border-slate-400"
                                    >
                                        {isDuplicating && <Spinner className="mr-2" />}
                                        <Copy className="mr-2 h-4 w-4" />
                                        Duplicate
                                    </Button>
                                </div>
                            </section>

                            {/* Metadata */}
                            <section className="border-2 border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                                <h2 className="mb-4 font-mono text-xs uppercase tracking-wide text-slate-500">
                                    Details
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="font-mono text-xs uppercase text-slate-500">Created by</p>
                                            <p className="font-mono text-sm">{template.creator?.name || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="font-mono text-xs uppercase text-slate-500">Created</p>
                                            <p className="font-mono text-sm">{formatDate(template.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <LayoutGrid className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="font-mono text-xs uppercase text-slate-500">Times Used</p>
                                            <p className="font-mono text-sm">{template.usage_count}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="border-2 border-slate-200 dark:border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="font-mono text-lg font-bold uppercase">Delete Template</DialogTitle>
                        <DialogDescription className="font-mono text-sm">
                            Are you sure? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                            className="font-mono text-xs uppercase"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="font-mono text-xs uppercase"
                        >
                            {isDeleting && <Spinner className="mr-2" />}
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
