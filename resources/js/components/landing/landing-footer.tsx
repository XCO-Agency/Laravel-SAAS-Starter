import { Link } from '@inertiajs/react';
import { Github, Sparkles, Twitter } from 'lucide-react';

const footerLinks = {
    product: {
        title: 'Product',
        links: [
            { label: 'Features', href: '#features' },
            { label: 'FAQ', href: '#faq' },
            { label: 'Contributing', href: 'https://github.com/xco-agency/laravel-saas-starter/blob/main/CONTRIBUTING.md' },
        ],
    },
    company: {
        title: 'Company',
        links: [
            { label: 'About XCO Agency', href: 'https://xco.agency' },
            { label: 'Contact', href: 'mailto:support@xco.agency' },
        ],
    },
    resources: {
        title: 'Resources',
        links: [
            { label: 'Documentation', href: 'https://github.com/xco-agency/laravel-saas-starter#readme' },
            { label: 'GitHub', href: 'https://github.com/xco-agency/laravel-saas-starter' },
            { label: 'Issues', href: 'https://github.com/xco-agency/laravel-saas-starter/issues' },
            { label: 'Discussions', href: 'https://github.com/xco-agency/laravel-saas-starter/discussions' },
        ],
    },
    legal: {
        title: 'Legal',
        links: [
            { label: 'License', href: 'https://github.com/xco-agency/laravel-saas-starter/blob/main/LICENSE' },
            { label: 'Privacy Policy', href: '#' },
        ],
    },
};

const socialLinks = [
    { icon: Github, href: 'https://github.com/xco-agency/laravel-saas-starter', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
];

export function LandingFooter() {
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
                            <span className="text-xl font-bold tracking-tight">Laravel SAAS Starter</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                            The ultimate Laravel SaaS starter kit by XCO Agency. Build and launch your product 10x faster.
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
                        © {new Date().getFullYear()} XCO Agency. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
