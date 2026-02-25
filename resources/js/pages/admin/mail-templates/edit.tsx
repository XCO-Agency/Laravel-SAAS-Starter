import React from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MailTemplateProps {
    id: number;
    mailable_name: string;
    mailable: string;
    subject: string;
    html_template: string;
    text_template: string | null;
}

interface EditProps {
    mailTemplate: MailTemplateProps;
    variables: string[];
}

export default function MailTemplatesEdit({ mailTemplate, variables }: EditProps) {


    const { data, setData, put, processing, errors } = useForm({
        subject: mailTemplate.subject || '',
        html_template: mailTemplate.html_template || '',
        text_template: mailTemplate.text_template || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/mail-templates/' + mailTemplate.id);
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${mailTemplate.mailable_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/admin/mail-templates')}
                            className="mb-2 -ml-2 text-muted-foreground"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Templates
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Template: {mailTemplate.mailable_name}
                        </h1>
                        <p className="text-muted-foreground font-mono text-sm mt-1">
                            {mailTemplate.mailable}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Template Content</CardTitle>
                                    <CardDescription>
                                        Modify the subject, raw HTML layout, and plain text fallback representation of this system email.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject Line</Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            placeholder="Verify Your Email Address"
                                        />
                                        {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="html_template">HTML Template Layout</Label>
                                            <Badge variant="outline"><Code className="w-3 h-3 mr-1" /> HTML</Badge>
                                        </div>
                                        <Textarea
                                            id="html_template"
                                            value={data.html_template}
                                            onChange={(e) => setData('html_template', e.target.value)}
                                            className="min-h-[300px] font-mono text-sm"
                                            placeholder="<h1>Hello</h1><p>Welcome to our app!</p>"
                                        />
                                        {errors.html_template && <p className="text-sm text-destructive">{errors.html_template}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="text_template">Plain Text Fallback (Optional)</Label>
                                        <Textarea
                                            id="text_template"
                                            value={data.text_template}
                                            onChange={(e) => setData('text_template', e.target.value)}
                                            className="min-h-[150px] font-mono text-sm"
                                            placeholder="Hello\n\nWelcome to our app!"
                                        />
                                        {errors.text_template && <p className="text-sm text-destructive">{errors.text_template}</p>}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2 bg-muted/20 border-t pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit('/admin/mail-templates')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Template
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Available Variables</CardTitle>
                                <CardDescription>
                                    These dynamic properties will be automatically substituted when the email is dispatched.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {variables.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {variables.map((variable, idx) => (
                                            <div key={idx} className="flex flex-col p-3 rounded-md bg-muted/50 border">
                                                <code className="text-sm font-semibold select-all text-primary">
                                                    {'{{ '}{variable}{' }}'}
                                                </code>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No variables detected in current template. Use double curly braces to bind new placeholders.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
