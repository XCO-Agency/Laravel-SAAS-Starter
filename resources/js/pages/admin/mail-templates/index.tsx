import React from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Mail } from 'lucide-react';

interface TemplateProps {
    id: number;
    mailable: string;
    subject: string;
    created_at: string;
    updated_at: string;
}

interface IndexProps {
    templates: {
        data: TemplateProps[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function MailTemplatesIndex({ templates }: IndexProps) {
    const { t } = useTranslations();

    return (
        <AdminLayout>
            <Head title={t('admin.mail_templates.title', 'Email Templates')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t('admin.mail_templates.title', 'Email Templates')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('admin.mail_templates.description', 'Customize default SaaS system emails dynamically.')}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('admin.mail_templates.list', 'System Email Library')}</CardTitle>
                        <CardDescription>
                            {t('admin.mail_templates.list_description', 'These templates natively override code-defined Mailable classes during dispatch.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {templates.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
                                <Mail className="h-8 w-8 text-muted-foreground mb-4" />
                                <h3 className="font-medium text-lg">No email templates found</h3>
                                <p className="text-muted-foreground mt-1 max-w-sm">
                                    No dynamic email templates have been seeded or registered in the database yet.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mailable Class</TableHead>
                                            <TableHead>Subject Line</TableHead>
                                            <TableHead>Last Updated</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {templates.data.map((template) => (
                                            <TableRow key={template.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        {template.mailable}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{template.subject}</TableCell>
                                                <TableCell>
                                                    {formatDistanceToNow(new Date(template.updated_at), { addSuffix: true })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.visit('/admin/mail-templates/' + template.id + '/edit')}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {templates.last_page > 1 && (
                            <div className="flex items-center justify-center py-4">
                                <Pagination>
                                    <PaginationContent>
                                        {templates.current_page > 1 && (
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href={templates.links[0].url || '#'}
                                                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                                        e.preventDefault();
                                                        if (templates.links[0].url) router.visit(templates.links[0].url as string);
                                                    }}
                                                />
                                            </PaginationItem>
                                        )}
                                        {templates.links.slice(1, -1).map((link, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    href={link.url || '#'}
                                                    isActive={link.active}
                                                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                                        e.preventDefault();
                                                        if (link.url) router.visit(link.url as string);
                                                    }}
                                                >
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        {templates.current_page < templates.last_page && (
                                            <PaginationItem>
                                                <PaginationNext
                                                    href={templates.links[templates.links.length - 1].url || '#'}
                                                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                                        e.preventDefault();
                                                        if (templates.links[templates.links.length - 1].url) {
                                                            router.visit(templates.links[templates.links.length - 1].url as string);
                                                        }
                                                    }}
                                                />
                                            </PaginationItem>
                                        )}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
