import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useTranslations } from '@/hooks/use-translations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface UsageItem {
    label: string;
    current: number;
    limit: number;
    message: string;
}

interface Props {
    workspace: {
        name: string;
        plan: string;
    };
    usage: Record<string, UsageItem>;
}

export default function Usage({ workspace, usage }: Props) {
    const { t } = useTranslations();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('usage.title', 'Usage Dashboard'),
            href: '/usage',
        },
    ];

    const getUsagePercentage = (current: number, limit: number) => {
        if (limit === -1) return 0;
        return Math.min(Math.round((current / limit) * 100), 100);
    };

    const isLimitReached = (current: number, limit: number) => {
        return limit !== -1 && current >= limit;
    };

    const getProgressColor = (current: number, limit: number) => {
        if (limit === -1) return 'bg-primary';
        const percentage = (current / limit) * 100;
        if (percentage >= 100) return 'bg-destructive';
        if (percentage >= 80) return 'bg-orange-500';
        return 'bg-primary';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('usage.title', 'Usage Dashboard')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">{t('usage.title', 'Usage Dashboard')}</h1>
                    <p className="text-muted-foreground">
                        {t('usage.description', 'Manage your workspace limits and monitor your current usage.')}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{t('usage.current_plan', 'Current Plan')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{workspace.plan}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {workspace.name}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mt-4">
                    {Object.entries(usage).map(([key, item]) => {
                        const reached = isLimitReached(item.current, item.limit);
                        const percentage = getUsagePercentage(item.current, item.limit);

                        return (
                            <Card key={key} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold">{item.label}</CardTitle>
                                        <CardDescription>{item.message}</CardDescription>
                                    </div>
                                    {reached ? (
                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    )}
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl font-bold">
                                            {item.current}
                                            <span className="text-muted-foreground text-sm font-normal ml-1">
                                                / {item.limit === -1 ? '∞' : item.limit}
                                            </span>
                                        </span>
                                        {item.limit !== -1 && (
                                            <span className="text-sm font-medium">
                                                {percentage}%
                                            </span>
                                        )}
                                    </div>
                                    {item.limit !== -1 && (
                                        <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ease-in-out ${getProgressColor(item.current, item.limit)}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    )}

                                    {reached && (
                                        <Alert variant="destructive" className="mt-4 bg-destructive/5 border-destructive/20 py-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-xs">
                                                {t('usage.limit_reached_alert', 'Limit reached. Upgrade your plan to increase your capacity.')}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
