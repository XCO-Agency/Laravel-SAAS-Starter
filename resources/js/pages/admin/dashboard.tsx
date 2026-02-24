import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface AdminDashboardProps {
    metrics: {
        total_users: number;
        total_workspaces: number;
    };
}

export default function AdminDashboard({ metrics }: AdminDashboardProps) {
    return (
        <AppLayout>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 rounded-xl border border-sidebar-border/70">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
                        <p className="text-muted-foreground text-sm">Monitor platform metrics across all workspaces.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Total Users</h3>
                            <svg className="lucide lucide-users h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="text-2xl font-bold">{metrics.total_users}</div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Total Workspaces</h3>
                            <svg className="lucide lucide-briefcase h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" /></svg>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="text-2xl font-bold">{metrics.total_workspaces}</div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
