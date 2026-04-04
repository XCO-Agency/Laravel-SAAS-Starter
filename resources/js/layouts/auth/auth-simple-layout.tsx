import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { useTranslations } from '@/hooks/use-translations';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Quote, Sparkles, Users } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { t } = useTranslations();

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-10 text-white lg:flex">
                {/* Logo & Back Link */}
                <div className="flex items-center justify-between">
                    <Link
                        href={home()}
                        className="flex items-center gap-2 font-semibold"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent">
                            <Sparkles className="h-4 w-4 text-foreground" />
                        </div>
                        <span className="text-base text-white">Laravel SAAS Starter</span>
                    </Link>
                    <Link
                        href={home()}
                        className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('auth.layout.back_to_home', 'Back to home')}
                    </Link>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl leading-tight font-bold text-white">
                            {t(
                                'auth.layout.hero.title_line1',
                                'Launch Your SaaS',
                            )}
                            <br />
                            <span className="text-accent">{t('auth.layout.hero.title_line2', '10x Faster')}</span>
                        </h2>
                        <p className="text-lg text-white/50">
                            {t(
                                'auth.layout.hero.description',
                                'Join thousands of developers building and shipping with Laravel SAAS Starter.',
                            )}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                                <Users className="h-5 w-5 text-white/70" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tabular-nums text-white">
                                    10,000+
                                </div>
                                <div className="text-sm text-white/40">
                                    {t(
                                        'auth.layout.stats.developers',
                                        'Developers',
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                                <CheckCircle className="h-5 w-5 text-white/70" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tabular-nums text-white">500+</div>
                                <div className="text-sm text-white/40">
                                    {t(
                                        'auth.layout.stats.apps_launched',
                                        'Apps Launched',
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="rounded-md border border-white/10 bg-white/5 p-5">
                        <Quote className="mb-3 h-6 w-6 text-white/20" />
                        <p className="mb-4 text-sm leading-relaxed text-white/70">
                            "
                            {t(
                                'auth.layout.testimonial.quote',
                                'Laravel SAAS Starter saved us months of development time. We launched our MVP in just 2 weeks!',
                            )}
                            "
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent text-xs font-semibold text-foreground">
                                SC
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">
                                    {t(
                                        'auth.layout.testimonial.author',
                                        'Sarah Chen',
                                    )}
                                </div>
                                <div className="text-xs text-white/40">
                                    {t(
                                        'auth.layout.testimonial.role',
                                        'CTO at TechFlow',
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-xs text-white/30">
                    © {new Date().getFullYear()}{' '}
                    {t(
                        'auth.layout.copyright',
                        'XCO Agency. All rights reserved.',
                    )}
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col">
                {/* Mobile Header */}
                <div className="flex items-center justify-between border-b p-4 lg:hidden">
                    <Link
                        href={home()}
                        className="flex items-center gap-2 font-semibold"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-foreground">
                            <Sparkles className="h-4 w-4 text-background" />
                        </div>
                        <span className="text-base">Laravel SAAS Starter</span>
                    </Link>
                    <AppearanceToggleDropdown />
                </div>

                {/* Form Container */}
                <div className="flex flex-1 items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-sm">
                        {/* Desktop Theme Toggle */}
                        <div className="mb-8 hidden justify-end lg:flex">
                            <AppearanceToggleDropdown />
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Title & Description */}
                            <div className="space-y-2 text-center lg:text-left">
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    {title}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>

                            {/* Form Content */}
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
