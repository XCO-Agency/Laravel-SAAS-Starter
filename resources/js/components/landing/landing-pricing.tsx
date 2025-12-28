import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

export function LandingPricing() {
    const { auth } = usePage<SharedData>().props;

    return (
        <section id="pricing" className="py-20 sm:py-32 bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Completely{' '}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Free
                        </span>{' '}
                        & Open Source
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        No credit card required. No hidden fees. Use it for unlimited personal and commercial projects.
                    </p>
                </div>

                {/* Open Source Benefits */}
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="relative border-primary/20">
                        <CardHeader>
                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">100% Free</CardTitle>
                            <CardDescription>
                                No subscriptions, no per-project fees, no royalties. Use it however you want.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="relative border-primary/20">
                        <CardHeader>
                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Check className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">MIT License</CardTitle>
                            <CardDescription>
                                Completely open source with permissive licensing. Commercial use is welcome.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="relative border-primary/20">
                        <CardHeader>
                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Production Ready</CardTitle>
                            <CardDescription>
                                Battle-tested code following Laravel best practices. Ready for production use.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <Button size="lg" asChild className="h-12 px-8 text-base">
                        <Link href={auth.user ? '/dashboard' : register()}>
                            Get Started Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Or{' '}
                        <a
                            href="https://github.com/xco-agency/laravel-saas-starter"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline"
                        >
                            view on GitHub
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}
