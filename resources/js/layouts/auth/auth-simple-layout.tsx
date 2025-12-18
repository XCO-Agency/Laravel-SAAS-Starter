import AppLogoIcon from '@/components/app-logo-icon';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
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
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Left Side - Branding & Visual */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent p-10 text-primary-foreground lg:flex">
                {/* Background decoration */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                </div>

                {/* Logo & Back Link */}
                <div className="flex items-center justify-between">
                    <Link href={home()} className="flex items-center gap-2 font-semibold">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="text-xl">Farouq</span>
                    </Link>
                    <Link
                        href={home()}
                        className="flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold leading-tight">
                            Launch Your SaaS
                            <br />
                            10x Faster
                        </h2>
                        <p className="text-lg text-white/80">
                            Join thousands of developers building and shipping with Farouq.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">10,000+</div>
                                <div className="text-sm text-white/70">Developers</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">500+</div>
                                <div className="text-sm text-white/70">Apps Launched</div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                        <Quote className="mb-4 h-8 w-8 text-white/40" />
                        <p className="mb-4 text-white/90">
                            "Farouq saved us months of development time. We launched our MVP in just 2 weeks!"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                                SC
                            </div>
                            <div>
                                <div className="font-medium">Sarah Chen</div>
                                <div className="text-sm text-white/70">CTO at TechFlow</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-sm text-white/60">
                    © {new Date().getFullYear()} Farouq. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col">
                {/* Mobile Header */}
                <div className="flex items-center justify-between border-b p-4 lg:hidden">
                    <Link href={home()} className="flex items-center gap-2 font-semibold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Sparkles className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-lg">Farouq</span>
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
                                <p className="text-sm text-muted-foreground">{description}</p>
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
