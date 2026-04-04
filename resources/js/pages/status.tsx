import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Wrench,
} from 'lucide-react';

interface StatusIncident {
    id: number;
    title: string;
    message: string;
    status: string;
    resolved_at: string | null;
    created_at: string;
}

interface StatusProps {
    incidents: StatusIncident[];
    overallStatus: string;
}

const STATUS_CONFIG: Record<
    string,
    {
        label: string;
        badgeClass: string;
        icon: typeof CheckCircle2;
        bannerClass: string;
    }
> = {
    operational: {
        label: 'All Systems Operational',
        icon: CheckCircle2,
        badgeClass:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
        bannerClass:
            'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300',
    },
    degraded: {
        label: 'Degraded Performance',
        icon: AlertTriangle,
        badgeClass:
            'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        bannerClass:
            'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300',
    },
    outage: {
        label: 'Service Outage',
        icon: AlertTriangle,
        badgeClass:
            'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
        bannerClass:
            'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300',
    },
    maintenance: {
        label: 'Scheduled Maintenance',
        icon: Wrench,
        badgeClass:
            'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
        bannerClass:
            'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300',
    },
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Status({ incidents, overallStatus }: StatusProps) {
    const overall = STATUS_CONFIG[overallStatus] ?? STATUS_CONFIG.operational;
    const OverallIcon = overall.icon;

    return (
        <>
            <Head title="System Status" />
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Home
                        </Link>
                        <div className="h-4 w-px bg-border" />
                        <h1 className="text-sm font-semibold">System Status</h1>
                    </div>
                </header>

                {/* Content */}
                <main className="mx-auto max-w-3xl px-4 py-12">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">
                            System Status
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Current operational status and recent incidents.
                        </p>
                    </div>

                    {/* Overall status banner */}
                    <div
                        className={`mb-8 flex items-center gap-3 rounded-md border p-4 ${overall.bannerClass}`}
                    >
                        <OverallIcon className="h-5 w-5 shrink-0" />
                        <span className="font-semibold">{overall.label}</span>
                    </div>

                    {/* Incident list */}
                    {incidents.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500/60" />
                            <p className="font-medium">
                                No incidents in the last 90 days
                            </p>
                            <p className="mt-1 text-sm">
                                Everything is running smoothly.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Incident History (last 90 days)
                            </h3>
                            {incidents.map((incident) => {
                                const cfg =
                                    STATUS_CONFIG[incident.status] ??
                                    STATUS_CONFIG.operational;

                                return (
                                    <div
                                        key={incident.id}
                                        className="rounded-md border p-4"
                                    >
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badgeClass}`}
                                            >
                                                {incident.status ===
                                                    'maintenance' && (
                                                    <Clock className="h-3 w-3" />
                                                )}
                                                {incident.status ===
                                                    'outage' && (
                                                    <AlertTriangle className="h-3 w-3" />
                                                )}
                                                {incident.status ===
                                                    'degraded' && (
                                                    <AlertTriangle className="h-3 w-3" />
                                                )}
                                                {incident.status ===
                                                    'operational' && (
                                                    <CheckCircle2 className="h-3 w-3" />
                                                )}
                                                {cfg.label}
                                            </span>
                                            {incident.resolved_at && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs text-emerald-600 dark:text-emerald-400"
                                                >
                                                    Resolved
                                                </Badge>
                                            )}
                                        </div>
                                        <h4 className="font-semibold">
                                            {incident.title}
                                        </h4>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {incident.message}
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                            <span>
                                                Reported:{' '}
                                                {formatDate(
                                                    incident.created_at,
                                                )}
                                            </span>
                                            {incident.resolved_at && (
                                                <span>
                                                    Resolved:{' '}
                                                    {formatDate(
                                                        incident.resolved_at,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
