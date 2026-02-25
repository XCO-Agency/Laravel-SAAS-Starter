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
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, CheckCircle, Clock, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface RetentionPolicy {
    key: string;
    label: string;
    enabled: boolean;
    days: number;
    notes: string;
}

interface RetentionProps {
    policies: RetentionPolicy[];
}

export default function Retention({ policies }: RetentionProps) {
    const [running, setRunning] = useState(false);
    const [output, setOutput] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runPrune = async (dryRun: boolean) => {
        setRunning(true);
        setOutput(null);
        setError(null);

        try {
            const response = await axios.post('/admin/retention/prune', { dry_run: dryRun });
            setOutput(response.data.output ?? 'Done.');
        } catch {
            setError('Failed to run pruning command. Check server logs.');
        } finally {
            setRunning(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Data Retention" />

            <div className="p-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Data Retention Policies
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Records older than each policy's threshold are pruned automatically every day at 03:00 UTC.
                    </p>
                </div>

                {/* Policies Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Policies</CardTitle>
                        <CardDescription>
                            Adjust thresholds in <code className="text-xs bg-muted px-1 py-0.5 rounded">config/retention.php</code> or via environment variables.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 font-medium">Data Type</th>
                                        <th className="pb-3 font-medium">Retention Period</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {policies.map((policy) => (
                                        <tr key={policy.key} className="align-top">
                                            <td className="py-3 font-medium">{policy.label}</td>
                                            <td className="py-3">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {policy.days} days
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                {policy.enabled ? (
                                                    <Badge variant="default" className="bg-emerald-500 text-white">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Disabled</Badge>
                                                )}
                                            </td>
                                            <td className="py-3 text-muted-foreground">{policy.notes || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Manual Trigger */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manual Pruning</CardTitle>
                        <CardDescription>
                            Run pruning on demand. Use "Dry Run" first to preview what will be deleted.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => runPrune(true)}
                                disabled={running}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${running ? 'animate-spin' : ''}`} />
                                Dry Run (Preview)
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => runPrune(false)}
                                disabled={running}
                            >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Run Pruning Now
                            </Button>
                        </div>

                        {output && (
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="h-4 w-4" />
                                    Command Output
                                </div>
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{output}</pre>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Environment Variables */}
                <Card>
                    <CardHeader>
                        <CardTitle>Environment Variables</CardTitle>
                        <CardDescription>Override retention periods in your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> file.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 font-mono text-xs">
                            {[
                                ['RETENTION_NOTIFICATIONS_DAYS', '90'],
                                ['RETENTION_ACTIVITY_DAYS', '180'],
                                ['RETENTION_WEBHOOK_LOGS_DAYS', '90'],
                                ['RETENTION_FEEDBACK_DAYS', '180'],
                            ].map(([key, def]) => (
                                <div key={key} className="rounded-md bg-muted px-3 py-2">
                                    <span className="text-primary">{key}</span>
                                    <span className="text-muted-foreground">=</span>
                                    <span>{def}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
