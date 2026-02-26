import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { OnboardingChecklist } from '@/components/onboarding-checklist';
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

const getBreadcrumbs = (t: (key: string, fallback: string) => string): BreadcrumbItem[] => [
    {
        title: t('dashboard.title', 'Dashboard'),
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { currentWorkspace, auth } = usePage<SharedData>().props;
    const { t } = useTranslations();

    // Default values if no workspace data passed from controller
    const workspace = currentWorkspace;
    const membersCount = currentWorkspace?.members_count ?? 1;

    const quickActions = [
        {
            title: t('dashboard.invite_team_member', 'Invite Team Member'),
            description: t('dashboard.invite_team_member_desc', 'Add a colleague to your workspace'),
            icon: Users,
            href: '/team',
            color: 'text-blue-500',
        },
        {
            title: t('dashboard.manage_billing_title', 'Manage Billing'),
            description: t('dashboard.manage_billing_desc', 'View plans and invoices'),
            icon: CreditCard,
            href: '/billing',
            color: 'text-green-500',
        },
        {
            title: t('dashboard.workspace_settings', 'Workspace Settings'),
            description: t('dashboard.workspace_settings_desc', 'Configure your workspace'),
            icon: Settings,
            href: '/workspaces/settings',
            color: 'text-purple-500',
        },
        {
            title: t('dashboard.create_workspace', 'Create Workspace'),
            description: t('dashboard.create_workspace_desc', 'Start a new project'),
            icon: Plus,
            href: '/workspaces/create',
            color: 'text-orange-500',
        },
    ];

    const breadcrumbs = getBreadcrumbs(t);

    if (!workspace) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={t('dashboard.title', 'Dashboard')} />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-4">
                    <Building2 className="h-16 w-16 text-muted-foreground" />
                    <h2 className="text-2xl font-semibold">
                        {t('dashboard.no_workspace_selected', 'No Workspace Selected')}
                    </h2>
                    <p className="text-muted-foreground">
                        {t('dashboard.create_or_select', 'Create or select a workspace to get started.')}
                    </p>
                    <Button asChild>
                        <Link href="/workspaces/create">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('dashboard.create_workspace', 'Create Workspace')}
                        </Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title', 'Dashboard')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Onboarding Checklist */}
                <OnboardingChecklist />

                {/* Welcome Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {t('dashboard.welcome_back', 'Welcome back, {{name}}!', { name: auth.user?.name?.split(' ')[0] || '' })}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('dashboard.whats_happening', "Here's what's happening in {{workspace}}.", { workspace: workspace.name })}
                        </p>
                    </div>
                    {workspace.plan === 'Free' && (
                        <Button asChild>
                            <Link href="/billing/plans">
                                <Sparkles className="mr-2 h-4 w-4" />
                                {t('dashboard.upgrade_to_pro', 'Upgrade to Pro')}
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
                                {t('dashboard.current_workspace', 'Current Workspace')}
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
                                    {t('dashboard.personal_workspace', 'Personal workspace')}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Plan Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('dashboard.current_plan', 'Current Plan')}
                            </CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">
                                    {workspace.plan}
                                </span>
                                {workspace.plan !== 'Free' && (
                                    <Badge variant="secondary">{t('dashboard.active', 'Active')}</Badge>
                                )}
                            </div>
                            <Link
                                href="/billing"
                                className="mt-1 flex items-center text-xs text-muted-foreground hover:text-primary"
                            >
                                {t('dashboard.manage_billing', 'Manage billing')}
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Team Members Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('dashboard.team_members', 'Team Members')}
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
                                {t('dashboard.manage_team', 'Manage team')}
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Role Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('dashboard.your_role', 'Your Role')}
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
                                    t('dashboard.full_workspace_control', 'Full workspace control')}
                                {workspace.role === 'admin' &&
                                    t('dashboard.can_manage_team_settings', 'Can manage team & settings')}
                                {workspace.role === 'member' &&
                                    t('dashboard.standard_access', 'Standard access')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.quick_actions', 'Quick Actions')}</CardTitle>
                        <CardDescription>
                            {t('dashboard.quick_actions_description', 'Common tasks to help you get things done faster.')}
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
                                        {t('dashboard.upgrade_to_pro', 'Upgrade to Pro')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('dashboard.unlock_features', 'Unlock more workspaces, team members, and advanced features.')}
                                    </p>
                                </div>
                            </div>
                            <Button asChild>
                                <Link href="/billing/plans">
                                    {t('dashboard.view_plans', 'View Plans')}
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
