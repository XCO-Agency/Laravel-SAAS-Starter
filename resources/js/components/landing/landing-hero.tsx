import { Button } from '@/components/ui/button';
import { register } from '@/routes';
import { type SharedData } from '@/types';
import { useTranslations } from '@/hooks/use-translations';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Github, Play, Sparkles, Users, Zap } from 'lucide-react';

export function LandingHero() {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslations();

    const stats = [
        { icon: Users, value: '1,000+', label: t('landing.hero.stats.developers', 'Developers') },
        { icon: Zap, value: '50+', label: t('landing.hero.stats.features', 'Features') },
        { icon: Github, value: '100%', label: t('landing.hero.stats.opensource', 'Open Source') },
    ];

    const features = [
        t('landing.hero.features.auth', 'Authentication & 2FA'),
        t('landing.hero.features.team', 'Team Management'),
        t('landing.hero.features.billing', 'Stripe Billing'),
        t('landing.hero.features.dark_mode', 'Dark Mode'),
    ];

    return (
        <section className="relative overflow-hidden py-20 sm:py-32 lg:py-40">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
                <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                        <Sparkles className="h-4 w-4" />
                        <span>{t('landing.hero.badge', 'The Ultimate Laravel SaaS Starter')}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                        <span className="block">{t('landing.hero.title.part1', 'Build Your SaaS')}</span>
                        <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                            {t('landing.hero.title.part2', '10x Faster')}
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        {t('landing.hero.description', 'Production-ready Laravel SaaS starter kit with authentication, billing, teams, and everything you need. Launch your SaaS 10x faster.')} <span className="font-semibold text-foreground">{t('landing.hero.description_highlight', '100% Open Source.')}</span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button size="lg" asChild className="h-12 px-8 text-base">
                            <Link href={auth.user ? '/dashboard' : register()}>
                                {t('landing.hero.cta.get_started', 'Get Started Free')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                            <a
                                href="https://github.com/xco-agency/laravel-saas-starter"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Github className="mr-2 h-4 w-4" />
                                {t('landing.hero.cta.github', 'View on GitHub')}
                            </a>
                        </Button>
                        <Button size="lg" variant="ghost" asChild className="h-12 px-8 text-base">
                            <a
                                href="#features"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.querySelector('#features');
                                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                            >
                                <Play className="mr-2 h-4 w-4" />
                                {t('landing.hero.cta.features', 'See Features')}
                            </a>
                        </Button>
                    </div>

                    {/* Quick Features */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                        {features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="flex justify-center">
                                <stat.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="mt-2 text-2xl font-bold sm:text-3xl">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Hero Image/Preview */}
                <div className="relative mx-auto mt-16 max-w-5xl">
                    <div className="group relative aspect-video overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-muted shadow-2xl transition-all hover:shadow-primary/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                        <div className="relative flex h-full items-center justify-center p-8">
                            <div className="text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-hover:scale-110">
                                        <Sparkles className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <p className="text-lg font-semibold text-foreground">
                                    {t('landing.hero.preview.title', 'Production-Ready Dashboard')}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t('landing.hero.preview.description', 'Beautiful UI with dark mode, workspaces, and team management')}
                                </p>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {[t('landing.hero.preview.tags.multi_tenant', 'Multi-tenant'), t('landing.hero.preview.tags.stripe_billing', 'Stripe Billing'), t('landing.hero.preview.tags.team_roles', 'Team Roles'), t('landing.hero.preview.tags.2fa', '2FA')].map((tag) => (
                                        <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -left-4 -top-4 hidden h-24 w-24 rounded-lg border bg-background shadow-lg lg:block" />
                    <div className="absolute -bottom-4 -right-4 hidden h-24 w-24 rounded-lg border bg-background shadow-lg lg:block" />
                </div>
            </div>
        </section>
    );
}
