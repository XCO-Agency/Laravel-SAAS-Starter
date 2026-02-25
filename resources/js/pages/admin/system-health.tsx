import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Activity,
    AlertTriangle,
    Clock,
    Database,
    HardDrive,
    Layers,
    RefreshCw,
    RotateCcw,
    Server,
    Trash2,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface FailedJob {
    id: number;
    uuid: string;
    connection: string;
    queue: string;
    job_name: string;
    exception_summary: string;
    failed_at: string;
}

interface StorageUsage {
    app: string;
    logs: string;
    framework: string;
}

interface Stats {
    pending_jobs: number;
    failed_jobs: number;
    db_size: string;
    db_size_bytes: number;
    cache_driver: string;
    queue_driver: string;
    session_driver: string;
    php_version: string;
    laravel_version: string;
    storage: StorageUsage;
}

interface SystemHealthProps {
    failedJobs: FailedJob[];
    stats: Stats;
}

function StatCard({ title, value, icon: Icon, description, variant = 'default' }: {
    title: string;
    value: string | number;
    icon: typeof Activity;
    description?: string;
    variant?: 'default' | 'warning' | 'success';
}) {
    const iconColor = variant === 'warning' ? 'text-amber-500' : variant === 'success' ? 'text-emerald-500' : 'text-muted-foreground';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function SystemHealth({ failedJobs, stats }: SystemHealthProps) {
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const retryJob = async (id: number) => {
        setActionLoading(`retry-${id}`);
        try {
            await axios.post(`/admin/system-health/jobs/${id}/retry`);
            router.reload({ only: ['failedJobs', 'stats'] });
        } finally {
            setActionLoading(null);
        }
    };

    const deleteJob = async (id: number) => {
        setActionLoading(`delete-${id}`);
        try {
            await axios.delete(`/admin/system-health/jobs/${id}`);
            router.reload({ only: ['failedJobs', 'stats'] });
        } finally {
            setActionLoading(null);
        }
    };

    const flushAll = async () => {
        if (!confirm('Are you sure you want to delete all failed jobs? This cannot be undone.')) {
            return;
        }
        setActionLoading('flush');
        try {
            await axios.post('/admin/system-health/jobs/flush');
            router.reload({ only: ['failedJobs', 'stats'] });
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <AdminLayout>
            <Head title="System Health" />

            <div className="p-4 md:p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Activity className="h-6 w-6 text-primary" />
                            System Health
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor queue health, storage, and infrastructure status.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.reload()}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Pending Jobs"
                        value={stats.pending_jobs}
                        icon={Clock}
                        description="Jobs waiting in queue"
                        variant={stats.pending_jobs > 100 ? 'warning' : 'default'}
                    />
                    <StatCard
                        title="Failed Jobs"
                        value={stats.failed_jobs}
                        icon={AlertTriangle}
                        description="Jobs that need attention"
                        variant={stats.failed_jobs > 0 ? 'warning' : 'success'}
                    />
                    <StatCard
                        title="Database Size"
                        value={stats.db_size}
                        icon={Database}
                        description="SQLite database file"
                    />
                    <StatCard
                        title="PHP Version"
                        value={stats.php_version}
                        icon={Server}
                        description={`Laravel ${stats.laravel_version}`}
                    />
                </div>

                {/* Infrastructure Info */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Drivers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-muted-foreground" />
                                Infrastructure Drivers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { label: 'Cache', value: stats.cache_driver },
                                    { label: 'Queue', value: stats.queue_driver },
                                    { label: 'Session', value: stats.session_driver },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{item.label}</span>
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            {item.value}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Storage */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                                Storage Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { label: 'storage/app', value: stats.storage.app },
                                    { label: 'storage/logs', value: stats.storage.logs },
                                    { label: 'storage/framework', value: stats.storage.framework },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between text-sm">
                                        <span className="font-mono text-xs text-muted-foreground">{item.label}</span>
                                        <span className="font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Failed Jobs */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-muted-foreground" />
                                    Failed Jobs
                                </CardTitle>
                                <CardDescription>
                                    {stats.failed_jobs === 0
                                        ? 'No failed jobs. Everything is running smoothly.'
                                        : `${stats.failed_jobs} failed job${stats.failed_jobs > 1 ? 's' : ''} require attention.`}
                                </CardDescription>
                            </div>
                            {stats.failed_jobs > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={flushAll}
                                    disabled={actionLoading === 'flush'}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Flush All
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {failedJobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Activity className="h-10 w-10 mb-3 text-emerald-500/50" />
                                <p className="font-medium">All clear</p>
                                <p className="text-sm">No failed jobs in the queue.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">Job</th>
                                            <th className="pb-3 font-medium">Queue</th>
                                            <th className="pb-3 font-medium">Error</th>
                                            <th className="pb-3 font-medium">Failed At</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {failedJobs.map((job) => (
                                            <tr key={job.id} className="align-top">
                                                <td className="py-3 font-medium">{job.job_name}</td>
                                                <td className="py-3">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {job.queue}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 max-w-xs">
                                                    <p className="text-xs text-muted-foreground truncate" title={job.exception_summary}>
                                                        {job.exception_summary}
                                                    </p>
                                                </td>
                                                <td className="py-3 text-muted-foreground whitespace-nowrap">
                                                    {new Date(job.failed_at).toLocaleString()}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => retryJob(job.id)}
                                                            disabled={actionLoading === `retry-${job.id}`}
                                                            title="Retry"
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteJob(job.id)}
                                                            disabled={actionLoading === `delete-${job.id}`}
                                                            title="Delete"
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
