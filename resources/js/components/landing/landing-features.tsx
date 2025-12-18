import {
    Building2,
    CreditCard,
    Globe,
    Lock,
    Moon,
    Palette,
    Shield,
    Users,
    Zap,
} from 'lucide-react';

const features = [
    {
        icon: Lock,
        title: 'Authentication & 2FA',
        description:
            'Complete auth system with login, register, password reset, email verification, and two-factor authentication.',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
    },
    {
        icon: Building2,
        title: 'Multi-tenant Workspaces',
        description:
            'Built-in workspace management allowing users to create and switch between multiple organizations.',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
    },
    {
        icon: Users,
        title: 'Team Management',
        description:
            'Invite team members, assign roles (owner, admin, member), and manage permissions with ease.',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
    },
    {
        icon: CreditCard,
        title: 'Stripe Billing',
        description:
            'Full Stripe integration with subscriptions, invoices, billing portal, and multiple pricing tiers.',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
    },
    {
        icon: Globe,
        title: 'Internationalization',
        description:
            'Multi-language support with RTL layouts. Easily add new languages and translations.',
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10',
    },
    {
        icon: Moon,
        title: 'Dark Mode',
        description:
            'Beautiful light and dark themes with system preference detection and manual toggle.',
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
    },
    {
        icon: Shield,
        title: 'Security First',
        description:
            'Built with security best practices including CSRF protection, rate limiting, and secure sessions.',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
    },
    {
        icon: Zap,
        title: 'Modern Stack',
        description:
            'Laravel 12, Inertia.js v2, React 19, and Tailwind CSS v4 for a blazing-fast developer experience.',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
    },
    {
        icon: Palette,
        title: 'Beautiful UI',
        description:
            'Pre-built components with shadcn/ui design system. Fully customizable and accessible.',
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10',
    },
];

export function LandingFeatures() {
    return (
        <section id="features" className="py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Everything You Need to{' '}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Ship Faster
                        </span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Stop wasting weeks on boilerplate. We've built all the essential features so you can focus on what makes your product unique.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group relative rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                        >
                            <div
                                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor}`}
                            >
                                <feature.icon className={`h-6 w-6 ${feature.color}`} />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
