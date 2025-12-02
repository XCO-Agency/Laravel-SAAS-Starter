import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Building2, Upload, X } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Workspaces', href: '/workspaces' },
    { title: 'Create', href: '/workspaces/create' },
];

export default function CreateWorkspace() {
    const { data, setData, errors, processing, reset } = useForm({
        name: '',
        slug: '',
        logo: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setData('logo', null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setData('name', name);
        if (!data.slug || data.slug === generateSlug(data.name)) {
            setData('slug', generateSlug(name));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Only include logo if it's actually a file
        const formData: Record<string, unknown> = {
            name: data.name,
            slug: data.slug,
        };

        if (data.logo) {
            formData.logo = data.logo;
        }

        router.post('/workspaces', formData, {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Workspace" />

            <div className="space-y-6">
                <Heading
                    title="Create Workspace"
                    description="Create a new workspace to organize your projects and team."
                />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Workspace Details</CardTitle>
                        <CardDescription>
                            Enter the details for your new workspace.
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
                                            <button
                                                type="button"
                                                onClick={removeLogo}
                                                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed">
                                            <Building2 className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
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
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Logo
                                        </Button>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            PNG, JPG, GIF up to 2MB
                                        </p>
                                    </div>
                                </div>
                                <InputError message={errors.logo} />
                            </div>

                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Workspace Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    placeholder="My Awesome Workspace"
                                    required
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
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="my-awesome-workspace"
                                        className="rounded-l-none"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    This will be used in URLs. Only lowercase letters, numbers, and
                                    hyphens are allowed.
                                </p>
                                <InputError message={errors.slug} />
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner className="mr-2" />}
                                    Create Workspace
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/workspaces')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

