import { Link } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { Github, Sparkles, Twitter } from 'lucide-react';

export function LandingFooter() {
    const { t } = useTranslations();

    const footerLinks = {
        product: {
            title: t('landing.footer.cols.product.title', 'Product'),
            links: [
                { label: t('landing.footer.cols.product.features', 'Features'), href: '#features' },
                { label: t('landing.footer.cols.product.faq', 'FAQ'), href: '#faq' },
                { label: t('landing.footer.cols.product.contributing', 'Contributing'), href: 'https://github.com/xco-agency/laravel-saas-starter/blob/main/CONTRIBUTING.md' },
            ],
        },
        company: {
            title: t('landing.footer.cols.company.title', 'Company'),
            links: [
                { label: t('landing.footer.cols.company.about', 'About XCO Agency'), href: 'https://xco.agency' },
                { label: t('landing.footer.cols.company.contact', 'Contact'), href: 'mailto:support@xco.agency' },
            ],
        },
        resources: {
            title: t('landing.footer.cols.resources.title', 'Resources'),
            links: [
                { label: t('landing.footer.cols.resources.docs', 'Documentation'), href: 'https://github.com/xco-agency/laravel-saas-starter#readme' },
                { label: t('landing.footer.cols.resources.github', 'GitHub'), href: 'https://github.com/xco-agency/laravel-saas-starter' },
                { label: t('landing.footer.cols.resources.issues', 'Issues'), href: 'https://github.com/xco-agency/laravel-saas-starter/issues' },
                { label: t('landing.footer.cols.resources.discussions', 'Discussions'), href: 'https://github.com/xco-agency/laravel-saas-starter/discussions' },
            ],
        },
        legal: {
            title: t('landing.footer.cols.legal.title', 'Legal'),
            links: [
                { label: t('landing.footer.cols.legal.license', 'License'), href: 'https://github.com/xco-agency/laravel-saas-starter/blob/main/LICENSE' },
                { label: t('landing.footer.cols.legal.privacy', 'Privacy Policy'), href: '#' },
            ],
        },
    };

    const socialLinks = [
        { icon: Github, href: 'https://github.com/xco-agency/laravel-saas-starter', label: t('landing.footer.social.github', 'GitHub') },
        { icon: Twitter, href: '#', label: t('landing.footer.social.twitter', 'Twitter') },
    ];
    return (
        <footer className="border-t bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                {/* Top section */}
                <div className="grid gap-8 lg:grid-cols-6">
                    {/* Logo & Description */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                                <Sparkles className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">{t('landing.footer.brand', 'Laravel SAAS Starter')}</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                            {t('landing.footer.description', 'The ultimate Laravel SaaS starter kit by XCO Agency. Build and launch your product 10x faster.')}
                        </p>
                        {/* Social Links */}
                        <div className="mt-6 flex gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.values(footerLinks).map((section) => (
                        <div key={section.title}>
                            <h3 className="font-semibold">{section.title}</h3>
                            <ul className="mt-4 space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            target={link.href.startsWith('http') ? '_blank' : undefined}
                                            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom section */}
                <div className="mt-12 border-t pt-8">
                    <p className="text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} {t('landing.footer.copyright', 'XCO Agency. All rights reserved.')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
