import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Check,
    CreditCard,
    Globe,
    Lock,
    Sparkles,
    Users,
    Zap,
} from 'lucide-react';

const features = [
    {
        icon: Building2,
        title: 'Multi-Workspace',
        description:
            'Organize your work across multiple projects and clients with dedicated workspaces.',
    },
    {
        icon: Users,
        title: 'Team Collaboration',
        description:
            'Invite team members, assign roles, and collaborate seamlessly on shared projects.',
    },
    {
        icon: CreditCard,
        title: 'Flexible Billing',
        description:
            'Per-workspace billing with flexible plans. Scale each workspace independently.',
    },
    {
        icon: Lock,
        title: 'Enterprise Security',
        description:
            'Two-factor authentication, secure sessions, and granular access controls.',
    },
    {
        icon: Zap,
        title: 'Lightning Fast',
        description:
            'Built on modern technologies for exceptional performance and reliability.',
    },
    {
        icon: Globe,
        title: 'API Ready',
        description:
            'Full API access to integrate with your existing tools and workflows.',
    },
];

const plans = [
    {
        id: 'free',
        name: 'Free',
        description: 'Perfect for getting started',
        price: { monthly: 0, yearly: 0 },
        features: [
            '1 workspace',
            '1 team member',
            'Basic features',
            'Community support',
        ],
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'For growing teams',
        price: { monthly: 29, yearly: 290 },
        features: [
            '5 workspaces',
            '5 team members per workspace',
            'All features',
            'Priority support',
            'Advanced analytics',
        ],
        popular: true,
    },
    {
        id: 'business',
        name: 'Business',
        description: 'For larger organizations',
        price: { monthly: 99, yearly: 990 },
        features: [
            'Unlimited workspaces',
            'Unlimited team members',
            'All features',
            'Dedicated support',
            'Custom integrations',
            'SLA guarantee',
        ],
        popular: false,
    },
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth, name } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700&family=bricolage-grotesque:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
                {/* Navigation */}
                <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2">
                            <AppLogoIcon className="h-8 w-8" />
                            <span
                                className="text-xl font-bold"
                                style={{
                                    fontFamily:
                                        'Bricolage Grotesque, sans-serif',
                                }}
                            >
                                {name}
                            </span>
                        </Link>

                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href="/dashboard">Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href="/login">Sign In</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button asChild>
                                            <Link href="/register">
                                                Get Started
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
                        <div
                            className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl"
                            aria-hidden="true"
                        >
                            <div
                                className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary/30 to-secondary/30 opacity-30"
                                style={{
                                    clipPath:
                                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                }}
                            />
                        </div>
                    </div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl text-center">
                            <Badge variant="secondary" className="mb-6">
                                <Sparkles className="mr-1 h-3 w-3" />
                                Now in Beta
                            </Badge>
                            <h1
                                className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
                                style={{
                                    fontFamily:
                                        'Bricolage Grotesque, sans-serif',
                                }}
                            >
                                Build your SaaS
                                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    {' '}
                                    faster{' '}
                                </span>
                                than ever
                            </h1>
                            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                                The complete foundation for your next SaaS
                                application. Multi-tenancy, team management,
                                billing, and authentication — all out of the
                                box.
                            </p>
                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                {auth.user ? (
                                    <Button size="lg" asChild>
                                        <Link href="/dashboard">
                                            Go to Dashboard
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button size="lg" asChild>
                                            <Link href="/register">
                                                Start Free Trial
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            asChild
                                        >
                                            <a href="#pricing">View Pricing</a>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="mt-16 grid gap-4 sm:mt-24 sm:grid-cols-3">
                            <div className="rounded-xl border bg-card p-6 text-center">
                                <p className="text-4xl font-bold text-primary">
                                    10k+
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Active Users
                                </p>
                            </div>
                            <div className="rounded-xl border bg-card p-6 text-center">
                                <p className="text-4xl font-bold text-primary">
                                    99.9%
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Uptime
                                </p>
                            </div>
                            <div className="rounded-xl border bg-card p-6 text-center">
                                <p className="text-4xl font-bold text-primary">
                                    24/7
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Support
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2
                                className="text-3xl font-bold tracking-tight sm:text-4xl"
                                style={{
                                    fontFamily:
                                        'Bricolage Grotesque, sans-serif',
                                }}
                            >
                                Everything you need to build
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                A complete foundation with all the features your
                                SaaS needs from day one.
                            </p>
                        </div>

                        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => (
                                <Card
                                    key={feature.title}
                                    className="relative overflow-hidden"
                                >
                                    <CardHeader>
                                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                            <feature.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl">
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-base">
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2
                                className="text-3xl font-bold tracking-tight sm:text-4xl"
                                style={{
                                    fontFamily:
                                        'Bricolage Grotesque, sans-serif',
                                }}
                            >
                                Simple, transparent pricing
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Choose the plan that&apos;s right for you.
                                Upgrade or downgrade at any time.
                            </p>
                        </div>

                        <div className="mt-16 grid gap-8 lg:grid-cols-3">
                            {plans.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className={`relative flex flex-col ${
                                        plan.popular
                                            ? 'border-primary shadow-lg'
                                            : ''
                                    }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge>
                                                <Sparkles className="mr-1 h-3 w-3" />
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-xl">
                                            {plan.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {plan.description}
                                        </CardDescription>
                                        <div className="mt-4">
                                            <span className="text-4xl font-bold">
                                                ${plan.price.monthly}
                                            </span>
                                            <span className="text-muted-foreground">
                                                /month
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-3">
                                            {plan.features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            variant={
                                                plan.popular
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="w-full"
                                            asChild
                                        >
                                            <Link href="/register">
                                                Get Started
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 px-6 py-20 sm:px-12 sm:py-28">
                            <div className="bg-grid-white/10 absolute inset-0 [mask-image:radial-gradient(white,transparent_70%)]" />
                            <div className="relative mx-auto max-w-2xl text-center">
                                <h2
                                    className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl"
                                    style={{
                                        fontFamily:
                                            'Bricolage Grotesque, sans-serif',
                                    }}
                                >
                                    Ready to get started?
                                </h2>
                                <p className="mt-4 text-lg text-primary-foreground/80">
                                    Start building your SaaS today with our
                                    complete foundation. No credit card
                                    required.
                                </p>
                                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        asChild
                                    >
                                        <Link href="/register">
                                            Start Free Trial
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <AppLogoIcon className="h-6 w-6" />
                                <span className="font-semibold">{name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                © {new Date().getFullYear()} {name}. All rights
                                reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
