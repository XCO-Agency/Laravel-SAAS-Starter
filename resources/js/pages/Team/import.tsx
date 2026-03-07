import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    FileUp,
    SkipForward,
    Upload,
    Users,
    XCircle,
} from 'lucide-react';
import { useRef, type FormEvent } from 'react';

interface PreviewRow {
    email: string;
    role: string;
    status: 'valid' | 'invalid' | 'skipped';
    error: string | null;
}

interface PreviewResult {
    rows: PreviewRow[];
    valid: number;
    invalid: number;
    skipped: number;
}

interface TeamImportProps {
    workspace: {
        id: number;
        name: string;
    };
    canInvite: boolean;
    memberLimitMessage: string;
    preview?: PreviewResult;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Team', href: '/team' },
    { title: 'CSV Import', href: '/team/import' },
];

const STATUS_STYLES: Record<string, { badge: string; icon: typeof CheckCircle2 }> = {
    valid: {
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle2,
    },
    invalid: {
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle,
    },
    skipped: {
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        icon: SkipForward,
    },
};

export default function TeamImport({ workspace, canInvite, memberLimitMessage, preview }: TeamImportProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const processFileRef = useRef<HTMLInputElement>(null);
    const previewForm = useForm<{ csv_file: File | null }>({ csv_file: null });
    const processForm = useForm<{ csv_file: File | null }>({ csv_file: null });

    const handlePreview = (e: FormEvent) => {
        e.preventDefault();
        if (!fileInputRef.current?.files?.[0]) return;

        const formData = new FormData();
        formData.append('csv_file', fileInputRef.current.files[0]);

        router.post('/team/import/preview', formData, {
            forceFormData: true,
            preserveState: true,
        });
    };

    const handleProcess = () => {
        if (!fileInputRef.current?.files?.[0]) return;

        const formData = new FormData();
        formData.append('csv_file', fileInputRef.current.files[0]);

        router.post('/team/import/process', formData, {
            forceFormData: true,
        });
    };

    const downloadTemplate = () => {
        const csv = 'email,role\njane@example.com,member\njohn@example.com,admin\n';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'team-import-template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="CSV Import" />
            <SettingsLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-medium">
                            <FileUp className="h-5 w-5" />
                            Import Team Members
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Bulk import team members by uploading a CSV file with email addresses and roles.
                        </p>
                    </div>

                    {/* Plan limit info */}
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                        <Users className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                        {memberLimitMessage}
                    </div>

                    {!canInvite && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertTriangle className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                            You have reached your team member limit. Please upgrade your plan to invite more members.
                        </div>
                    )}

                    {/* Upload Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Upload CSV File</CardTitle>
                            <CardDescription>
                                Your CSV file should have an &ldquo;email&rdquo; column and optionally a &ldquo;role&rdquo; column (admin or member). Default role is member.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePreview} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.txt"
                                        className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button type="submit" size="sm" disabled={!canInvite}>
                                        <Upload className="mr-1.5 h-4 w-4" />
                                        Preview Import
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
                                        <Download className="mr-1.5 h-4 w-4" />
                                        Download Template
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Preview Results */}
                    {preview && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            Valid
                                        </div>
                                        <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{preview.valid}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            Invalid
                                        </div>
                                        <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{preview.invalid}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <SkipForward className="h-4 w-4 text-amber-500" />
                                            Skipped
                                        </div>
                                        <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{preview.skipped}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Preview Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Preview Results</CardTitle>
                                    <CardDescription>
                                        Review the parsed entries before sending invitations.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-xl border bg-card overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Email</th>
                                                    <th className="px-4 py-3 font-medium">Role</th>
                                                    <th className="px-4 py-3 font-medium">Status</th>
                                                    <th className="px-4 py-3 font-medium">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {preview.rows.map((row, i) => {
                                                    const style = STATUS_STYLES[row.status] || STATUS_STYLES.valid;
                                                    const StatusIcon = style.icon;
                                                    return (
                                                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                            <td className="px-4 py-3 font-mono text-xs">{row.email}</td>
                                                            <td className="px-4 py-3">
                                                                <Badge variant="outline" className="text-[10px] capitalize">{row.role}</Badge>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${style.badge}`}>
                                                                    <StatusIcon className="h-3 w-3" />
                                                                    {row.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                                {row.error || '—'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {preview.valid > 0 && (
                                        <div className="mt-4 flex items-center gap-3">
                                            <Button onClick={handleProcess} disabled={!canInvite}>
                                                <Upload className="mr-1.5 h-4 w-4" />
                                                Send {preview.valid} Invitation{preview.valid !== 1 ? 's' : ''}
                                            </Button>
                                            <p className="text-sm text-muted-foreground">
                                                This will send invitation emails to all valid entries.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
