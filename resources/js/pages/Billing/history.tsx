import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import WorkspaceLayout from '@/layouts/settings/workspace-layout';
import { type BreadcrumbItem, type Invoice } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Download, FileText, Receipt, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface BillingHistoryProps {
    invoices: Invoice[];
}

export default function BillingHistory({ invoices }: BillingHistoryProps) {
    const { t } = useTranslations();
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<
        'all' | 'last30' | 'last90' | 'lastYear'
    >('all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('billing.title', 'Billing'), href: '/billing' },
        {
            title: t('billing.history.title', 'Invoice History'),
            href: '/billing/history',
        },
    ];

    const filteredInvoices = useMemo(() => {
        let filtered = [...invoices];

        // Date filtering
        const now = new Date();
        if (dateFilter === 'last30') {
            const cutoff = new Date(now.setDate(now.getDate() - 30));
            filtered = filtered.filter((inv) => new Date(inv.date) >= cutoff);
        } else if (dateFilter === 'last90') {
            const cutoff = new Date(now.setDate(now.getDate() - 90));
            filtered = filtered.filter((inv) => new Date(inv.date) >= cutoff);
        } else if (dateFilter === 'lastYear') {
            const cutoff = new Date(now.setFullYear(now.getFullYear() - 1));
            filtered = filtered.filter((inv) => new Date(inv.date) >= cutoff);
        }

        // Search filtering
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (inv) =>
                    inv.date.toLowerCase().includes(query) ||
                    inv.total.toString().includes(query) ||
                    inv.id.toLowerCase().includes(query),
            );
        }

        return filtered;
    }, [invoices, searchQuery, dateFilter]);

    const totalAmount = useMemo(() => {
        return filteredInvoices.reduce(
            (sum, inv) => sum + Number(inv.total),
            0,
        );
    }, [filteredInvoices]);

    const clearFilters = () => {
        setSearchQuery('');
        setDateFilter('all');
    };

    const hasFilters = searchQuery || dateFilter !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('billing.history.title', 'Invoice History')} />

            <WorkspaceLayout
                title={t('billing.history.title', 'Invoice History')}
                description={t(
                    'billing.history.description',
                    'View and download all your invoices',
                )}
                fullWidth
            >
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>
                                    Total Invoices
                                </CardDescription>
                                <CardTitle className="text-3xl">
                                    {invoices.length}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>
                                    Filtered Amount
                                </CardDescription>
                                <CardTitle className="text-3xl">
                                    ${(totalAmount / 100).toFixed(2)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Last Invoice</CardDescription>
                                <CardTitle className="text-lg">
                                    {invoices.length > 0
                                        ? invoices[0].date
                                        : 'N/A'}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="relative max-w-sm flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search invoices..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute top-1/2 right-3 -translate-y-1/2"
                                        >
                                            <X className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant={
                                            dateFilter === 'all'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => setDateFilter('all')}
                                    >
                                        All Time
                                    </Button>
                                    <Button
                                        variant={
                                            dateFilter === 'last30'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => setDateFilter('last30')}
                                    >
                                        30 Days
                                    </Button>
                                    <Button
                                        variant={
                                            dateFilter === 'last90'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => setDateFilter('last90')}
                                    >
                                        90 Days
                                    </Button>
                                    <Button
                                        variant={
                                            dateFilter === 'lastYear'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            setDateFilter('lastYear')
                                        }
                                    >
                                        1 Year
                                    </Button>
                                </div>
                            </div>

                            {hasFilters && (
                                <div className="mt-4 flex items-center gap-2 border-t pt-4">
                                    <span className="text-sm text-muted-foreground">
                                        Showing {filteredInvoices.length} of{' '}
                                        {invoices.length} invoices
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        Clear filters
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invoices List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Invoices
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredInvoices.length === 0 ? (
                                <div className="py-12 text-center">
                                    <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        {hasFilters
                                            ? 'No invoices match your filters.'
                                            : 'No invoices found.'}
                                    </p>
                                    {hasFilters && (
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredInvoices.map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="-mx-4 flex items-center justify-between px-4 py-4 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                    <Calendar className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {invoice.date}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Invoice #{invoice.id}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-lg font-bold">
                                                    $
                                                    {(
                                                        Number(invoice.total) /
                                                        100
                                                    ).toFixed(2)}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <a href={invoice.pdf_url}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        PDF
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Back to Billing */}
                    <div className="flex justify-center">
                        <Button variant="outline" asChild>
                            <Link href="/billing">Back to Billing</Link>
                        </Button>
                    </div>
                </div>
            </WorkspaceLayout>
        </AppLayout>
    );
}
