import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { LanguageSwitcher } from '@/components/language-switcher';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { useTranslations } from '@/hooks/use-translations';

interface LandingHeaderProps {
    canRegister?: boolean;
}

export function LandingHeader({ canRegister = true }: LandingHeaderProps) {
    const { t } = useTranslations();
    const { auth, locale } = usePage<SharedData>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '#features', label: t('landing.nav.features', 'Features') },
        { href: '#pricing', label: t('landing.nav.pricing', 'Pricing') },
        { href: '#testimonials', label: t('landing.nav.testimonials', 'Testimonials') },
        { href: '#faq', label: t('landing.nav.faq', 'FAQ') },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Laravel SAAS Starter</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            onClick={(e) => {
                                if (link.href.startsWith('#')) {
                                    e.preventDefault();
                                    const element = document.querySelector(link.href);
                                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    <LanguageSwitcher currentLocale={locale} />
                    <AppearanceToggleDropdown />
                    {auth.user ? (
                        <Button asChild>
                            <Link href={dashboard()}>{t('landing.nav.dashboard', 'Dashboard')}</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href={login()}>{t('landing.nav.signin', 'Sign In')}</Link>
                            </Button>
                            {canRegister && (
                                <Button asChild>
                                    <Link href={register()}>{t('landing.hero.get_started', 'Get Started')}</Link>
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className="flex items-center gap-2 md:hidden">
                    <LanguageSwitcher currentLocale={locale} />
                    <AppearanceToggleDropdown />
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-sm">
                            <div className="flex flex-col gap-6 pt-6">
                                <nav className="flex flex-col gap-4">
                                    {navLinks.map((link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            onClick={(e) => {
                                                setMobileMenuOpen(false);
                                                if (link.href.startsWith('#')) {
                                                    e.preventDefault();
                                                    setTimeout(() => {
                                                        const element = document.querySelector(link.href);
                                                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }, 100);
                                                }
                                            }}
                                            className="text-lg font-medium text-foreground"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </nav>
                                <div className="flex flex-col gap-3">
                                    {auth.user ? (
                                        <Button asChild className="w-full">
                                            <Link href={dashboard()}>{t('landing.nav.dashboard', 'Dashboard')}</Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="outline" asChild className="w-full">
                                                <Link href={login()}>{t('landing.nav.signin', 'Sign In')}</Link>
                                            </Button>
                                            {canRegister && (
                                                <Button asChild className="w-full">
                                                    <Link href={register()}>{t('landing.hero.get_started', 'Get Started')}</Link>
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
