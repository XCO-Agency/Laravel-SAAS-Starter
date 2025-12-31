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
import { useTranslations } from '@/hooks/use-translations';

export function LandingFeatures() {
    const { t } = useTranslations();

    const features = [
        {
            icon: Lock,
            title: t('landing.features.items.auth.title', 'Authentication & 2FA'),
            description: t('landing.features.items.auth.description', 'Complete auth system with login, register, password reset, email verification, and two-factor authentication.'),
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            icon: Building2,
            title: t('landing.features.items.workspaces.title', 'Multi-tenant Workspaces'),
            description: t('landing.features.items.workspaces.description', 'Built-in workspace management allowing users to create and switch between multiple organizations.'),
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            icon: Users,
            title: t('landing.features.items.team.title', 'Team Management'),
            description: t('landing.features.items.team.description', 'Invite team members, assign roles (owner, admin, member), and manage permissions with ease.'),
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            icon: CreditCard,
            title: t('landing.features.items.billing.title', 'Stripe Billing'),
            description: t('landing.features.items.billing.description', 'Full Stripe integration with subscriptions, invoices, billing portal, and multiple pricing tiers.'),
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
        {
            icon: Globe,
            title: t('landing.features.items.i18n.title', 'Internationalization'),
            description: t('landing.features.items.i18n.description', 'Multi-language support with RTL layouts. Easily add new languages and translations.'),
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-500/10',
        },
        {
            icon: Moon,
            title: t('landing.features.items.dark_mode.title', 'Dark Mode'),
            description: t('landing.features.items.dark_mode.description', 'Beautiful light and dark themes with system preference detection and manual toggle.'),
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
        },
        {
            icon: Shield,
            title: t('landing.features.items.security.title', 'Security First'),
            description: t('landing.features.items.security.description', 'Built with security best practices including CSRF protection, rate limiting, and secure sessions.'),
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            icon: Zap,
            title: t('landing.features.items.stack.title', 'Modern Stack'),
            description: t('landing.features.items.stack.description', 'Laravel 12, Inertia.js v2, React 19, and Tailwind CSS v4 for a blazing-fast developer experience.'),
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
        },
        {
            icon: Palette,
            title: t('landing.features.items.ui.title', 'Beautiful UI'),
            description: t('landing.features.items.ui.description', 'Pre-built components with shadcn/ui design system. Fully customizable and accessible.'),
            color: 'text-pink-500',
            bgColor: 'bg-pink-500/10',
        },
    ];

    return (
        <section id="features" className="py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        {t('landing.features.title.part1', 'Everything You Need to')}{' '}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {t('landing.features.title.part2', 'Ship Faster')}
                        </span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t('landing.features.description', 'Stop wasting weeks on boilerplate. Everything you need is included and ready to use. Focus on building what makes your product unique.')}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group relative rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                        >
                            <div
                                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${feature.bgColor}`}
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
