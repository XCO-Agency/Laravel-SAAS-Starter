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
import { Spinner } from '@/components/ui/spinner';
import { type BreadcrumbItem, type Workspace } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, LayoutGrid, Code, Megaphone, TrendingUp, Headphones, Folder, Kanban, Check } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

interface CreateTemplateProps {
    workspace: Workspace;
}

const CATEGORIES = [
    { value: 'project_management', label: 'Project Management', icon: Kanban },
    { value: 'development', label: 'Development', icon: Code },
    { value: 'marketing', label: 'Marketing', icon: Megaphone },
    { value: 'sales', label: 'Sales', icon: TrendingUp },
    { value: 'support', label: 'Support', icon: Headphones },
    { value: 'other', label: 'Other', icon: Folder },
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Templates', href: '/workspace-templates' },
    { title: 'Create', href: '#' },
];

export default function CreateWorkspaceTemplate({ workspace }: CreateTemplateProps) {
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, errors, processing, post } = useForm({
        name: `${workspace.name} Template`,
        description: '',
        category: 'other',
        is_public: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/workspace-templates', {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => {
                    router.visit('/workspace-templates');
                }, 1500);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Template" />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                {/* Header */}
                <header className="border-b-4 border-violet-500 bg-white dark:border-violet-600 dark:bg-slate-900">
                    <div className="container mx-auto max-w-3xl px-6 py-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/workspace-templates')}
                            className="mb-4 -ml-2 font-mono text-xs uppercase text-slate-500 hover:text-slate-900"
                        >
                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                            Back to Templates
                        </Button>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-violet-500">
                                <span className="h-px w-8 bg-violet-500" />
                                Template Factory
                            </div>
                            <h1 className="font-mono text-3xl font-black uppercase tracking-tight">
                                Create Template
                            </h1>
                            <p className="font-mono text-sm text-slate-500">
                                Save your current workspace as a reusable template
                            </p>
                        </div>
                    </div>
                </header>

                {/* Form */}
                <main className="container mx-auto max-w-3xl px-6 py-8">
                    {showSuccess ? (
                        <div className="border-2 border-emerald-500 bg-emerald-50 p-8 text-center dark:bg-emerald-950/30">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-emerald-500 text-white">
                                <Check className="h-8 w-8" />
                            </div>
                            <h3 className="font-mono text-lg font-bold uppercase">Template Created!</h3>
                            <p className="mt-2 font-mono text-sm text-slate-600">
                                Redirecting to templates gallery...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Source Workspace */}
                            <section className="border-2 border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                                <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-slate-500">
                                    <LayoutGrid className="h-4 w-4" />
                                    Source Workspace
                                </div>
                                <div className="flex items-center gap-4 border-l-4 border-violet-500 bg-slate-50 p-4 dark:bg-slate-800/50">
                                    {workspace.logo_url ? (
                                        <img
                                            src={workspace.logo_url}
                                            alt={workspace.name}
                                            className="h-12 w-12 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center bg-violet-500 text-lg font-bold text-white">
                                            {workspace.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-mono text-sm font-bold">{workspace.name}</p>
                                        <p className="font-mono text-xs text-slate-500">{workspace.slug}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Template Details */}
                            <section className="border-2 border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                                <div className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-slate-500">
                                    <Save className="h-4 w-4" />
                                    Template Details
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wide">
                                            Template Name <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-2 border-2 border-slate-200 font-mono text-sm focus:border-violet-500 focus:ring-0 dark:border-slate-700"
                                            placeholder="e.g., Marketing Campaign Setup"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 font-mono text-xs text-rose-500">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="description" className="font-mono text-xs uppercase tracking-wide">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="mt-2 min-h-[100px] border-2 border-slate-200 font-mono text-sm focus:border-violet-500 focus:ring-0 dark:border-slate-700"
                                            placeholder="Describe what this template includes..."
                                        />
                                    </div>

                                    <div>
                                        <Label className="font-mono text-xs uppercase tracking-wide">
                                            Category <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.category}
                                            onValueChange={(value) => setData('category', value)}
                                        >
                                            <SelectTrigger className="mt-2 border-2 border-slate-200 font-mono text-sm focus:border-violet-500 focus:ring-0 dark:border-slate-700">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map((cat) => {
                                                    const Icon = cat.icon;
                                                    return (
                                                        <SelectItem key={cat.value} value={cat.value} className="font-mono text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="h-4 w-4" />
                                                                {cat.label}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (
                                            <p className="mt-1 font-mono text-xs text-rose-500">{errors.category}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                                        <input
                                            type="checkbox"
                                            id="is_public"
                                            checked={data.is_public}
                                            onChange={(e) => setData('is_public', e.target.checked)}
                                            className="h-4 w-4 rounded border-2 border-slate-300 text-violet-500 focus:ring-0"
                                        />
                                        <Label htmlFor="is_public" className="font-mono text-sm">
                                            Make this template public for all team members
                                        </Label>
                                    </div>
                                </div>
                            </section>

                            {/* What's Included */}
                            <section className="border-2 border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                                <div className="mb-4 font-mono text-xs uppercase tracking-wide text-slate-500">
                                    What's Included
                                </div>
                                <ul className="space-y-2 font-mono text-sm">
                                    {[
                                        'Workspace settings and configuration',
                                        'Custom fields and their configuration',
                                        'Tags and color schemes',
                                        'Branding settings (accent color)',
                                        'Webhook configurations',
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3">
                                            <span className="h-2 w-2 bg-emerald-500" />
                                            {item}
                                        </li>
                                    ))}
                                    <li className="flex items-center gap-3 text-slate-400 line-through">
                                        <span className="h-2 w-2 bg-slate-300" />
                                        Team members
                                        <span className="text-xs">(not included)</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-400 line-through">
                                        <span className="h-2 w-2 bg-slate-300" />
                                        API keys
                                        <span className="text-xs">(not included)</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Actions */}
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/workspace-templates')}
                                    className="border-2 border-slate-200 font-mono text-xs uppercase hover:border-slate-400"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="border-2 border-slate-900 bg-violet-500 font-mono text-xs uppercase tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-violet-600 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Create Template
                                </Button>
                            </div>
                        </form>
                    )}
                </main>
            </div>
        </AppLayout>
    );
}
