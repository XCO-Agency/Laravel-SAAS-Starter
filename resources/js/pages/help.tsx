import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Book,
    FileText,
    Mail,
    MessageCircle,
    Search,
    Ticket,
} from 'lucide-react';
import { useState } from 'react';

const helpCategories = [
    {
        icon: Book,
        title: 'Getting Started',
        description:
            'Learn the basics of setting up your workspace and account.',
        articles: [
            'Quick Start Guide',
            'Workspace Setup',
            'Inviting Team Members',
        ],
    },
    {
        icon: MessageCircle,
        title: 'Account & Billing',
        description: 'Manage your subscription, billing, and account settings.',
        articles: [
            'Subscription Plans',
            'Payment Methods',
            'Cancel Subscription',
        ],
    },
    {
        icon: Ticket,
        title: 'Support Tickets',
        description: 'Get help from our support team for technical issues.',
        articles: ['Create a Ticket', 'Ticket Status', 'Escalation Process'],
    },
    {
        icon: FileText,
        title: 'API Documentation',
        description: 'Integrate with our API for custom workflows.',
        articles: ['API Keys', 'Authentication', 'Rate Limits'],
    },
];

const quickLinks = [
    { title: 'Contact Support', href: '/settings/tickets', icon: Mail },
    { title: 'View Documentation', href: '/docs', icon: FileText },
    { title: 'System Status', href: '/status', icon: Book },
];

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <AppLayout breadcrumbs={[{ title: 'Help Center', href: '/help' }]}>
            <Head title="Help Center" />

            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold">
                        How can we help you?
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                        Search our knowledge base or browse categories to find
                        answers to your questions.
                    </p>

                    {/* Search */}
                    <div className="relative mx-auto max-w-xl">
                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search for articles, guides, or topics..."
                            className="h-12 pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mb-12 grid gap-4 md:grid-cols-3">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <link.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">{link.title}</h3>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    ))}
                </div>

                {/* Categories */}
                <div className="grid gap-6 md:grid-cols-2">
                    {helpCategories.map((category) => (
                        <Card
                            key={category.title}
                            className="transition-shadow hover:shadow-md"
                        >
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <category.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">
                                            {category.title}
                                        </CardTitle>
                                        <CardDescription>
                                            {category.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {category.articles.map((article) => (
                                        <li key={article}>
                                            <Button
                                                variant="ghost"
                                                className="h-auto w-full justify-start py-2 text-left"
                                                asChild
                                            >
                                                <Link href="#">
                                                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    {article}
                                                </Link>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Contact Section */}
                <Card className="mt-12 bg-muted/50">
                    <CardContent className="flex flex-col items-center justify-between gap-6 p-8 md:flex-row">
                        <div>
                            <h3 className="mb-2 text-xl font-bold">
                                Still need help?
                            </h3>
                            <p className="text-muted-foreground">
                                Can't find what you're looking for? Our support
                                team is here to help.
                            </p>
                        </div>
                        <Button size="lg" asChild>
                            <Link href="/settings/tickets">
                                <Ticket className="mr-2 h-4 w-4" />
                                Contact Support
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
