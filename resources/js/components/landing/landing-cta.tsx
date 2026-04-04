import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function LandingCta() {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslations();

    return (
        <section className="py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-lg bg-foreground p-8 sm:p-12 lg:p-16">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-sm bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
                            <Sparkles className="h-3.5 w-3.5" />
                            {t('landing.cta.badge', '100% Free & Open Source')}
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                            {t(
                                'landing.cta.title',
                                'Ready to Launch Your SaaS?',
                            )}
                        </h2>

                        <p className="mt-4 text-lg text-white/60 sm:text-xl">
                            {t(
                                'landing.cta.description',
                                'Join thousands of developers who are building and shipping faster with Laravel SAAS Starter. No credit card required. No subscriptions. Just clone and start building.',
                            )}
                        </p>

                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button
                                size="lg"
                                asChild
                                className="h-11 bg-accent px-7 text-sm font-semibold text-foreground hover:bg-accent/90"
                            >
                                <Link href={auth.user ? '/dashboard' : register()}>
                                    {t('landing.cta.get_started', 'Get Started Free')}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                asChild
                                className="h-11 border-white/20 bg-transparent px-7 text-sm text-white hover:bg-white/10 hover:text-white"
                            >
                                <a href="https://github.com/xco-agency/laravel-saas-starter" target="_blank" rel="noopener noreferrer">
                                    {t('landing.cta.github', 'View on GitHub')}
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
