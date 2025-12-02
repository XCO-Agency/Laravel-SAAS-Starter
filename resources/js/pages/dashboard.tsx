import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CreditCard,
    Crown,
    Plus,
    Settings,
    Sparkles,
    Users,
    Zap,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { currentWorkspace, auth } = usePage<SharedData>().props;

    // Default values if no workspace data passed from controller
    const workspace = currentWorkspace;
    const membersCount = currentWorkspace?.members_count ?? 1;

    const quickActions = [
        {
            title: 'Invite Team Member',
            description: 'Add a colleague to your workspace',
            icon: Users,
            href: '/team',
            color: 'text-blue-500',
        },
        {
            title: 'Manage Billing',
            description: 'View plans and invoices',
            icon: CreditCard,
            href: '/billing',
            color: 'text-green-500',
        },
        {
            title: 'Workspace Settings',
            description: 'Configure your workspace',
            icon: Settings,
            href: '/workspaces/settings',
            color: 'text-purple-500',
        },
        {
            title: 'Create Workspace',
            description: 'Start a new project',
            icon: Plus,
            href: '/workspaces/create',
            color: 'text-orange-500',
        },
    ];

    if (!workspace) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-4">
                    <Building2 className="h-16 w-16 text-muted-foreground" />
                    <h2 className="text-2xl font-semibold">
                        No Workspace Selected
                    </h2>
                    <p className="text-muted-foreground">
                        Create or select a workspace to get started.
                    </p>
                    <Button asChild>
                        <Link href="/workspaces/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Workspace
                        </Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Welcome Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Welcome back, {auth.user?.name?.split(' ')[0]}!
                        </h1>
                        <p className="text-muted-foreground">
                            Here&apos;s what&apos;s happening in{' '}
                            {workspace.name}.
                        </p>
                    </div>
                    {workspace.plan === 'Free' && (
                        <Button asChild>
                            <Link href="/billing/plans">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Upgrade to Pro
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Workspace Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Current Workspace
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                {workspace.logo_url ? (
                                    <img
                                        src={workspace.logo_url}
                                        alt={workspace.name}
                                        className="h-8 w-8 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                        <Building2 className="h-4 w-4 text-primary" />
                                    </div>
                                )}
                                <div className="truncate font-semibold">
                                    {workspace.name}
                                </div>
                            </div>
                            {workspace.personal_workspace && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Personal workspace
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Plan Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Current Plan
                            </CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">
                                    {workspace.plan}
                                </span>
                                {workspace.plan !== 'Free' && (
                                    <Badge variant="secondary">Active</Badge>
                                )}
                            </div>
                            <Link
                                href="/billing"
                                className="mt-1 flex items-center text-xs text-muted-foreground hover:text-primary"
                            >
                                Manage billing
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Team Members Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Team Members
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {membersCount}
                            </div>
                            <Link
                                href="/team"
                                className="mt-1 flex items-center text-xs text-muted-foreground hover:text-primary"
                            >
                                Manage team
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Role Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Your Role
                            </CardTitle>
                            <Crown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold capitalize">
                                    {workspace.role}
                                </span>
                                {workspace.role === 'owner' && (
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {workspace.role === 'owner' &&
                                    'Full workspace control'}
                                {workspace.role === 'admin' &&
                                    'Can manage team & settings'}
                                {workspace.role === 'member' &&
                                    'Standard access'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks to help you get things done faster.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.title}
                                    href={action.href}
                                    className="group flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted ${action.color}`}
                                    >
                                        <action.icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium">
                                            {action.title}
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {action.description}
                                        </p>
                                    </div>
                                    <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Getting Started / Upgrade Prompt */}
                {workspace.plan === 'Free' && (
                    <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
                        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        Upgrade to Pro
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Unlock more workspaces, team members,
                                        and advanced features.
                                    </p>
                                </div>
                            </div>
                            <Button asChild>
                                <Link href="/billing/plans">
                                    View Plans
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
