import { Button } from '@/components/ui/button';
import { register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function LandingCta() {
    const { auth } = usePage<SharedData>().props;

    return (
        <section className="py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-8 sm:p-12 lg:p-16">
                    {/* Background decoration */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                    </div>

                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
                            <Sparkles className="h-4 w-4" />
                            Start your 14-day free trial
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                            Ready to Launch Your SaaS?
                        </h2>

                        <p className="mt-4 text-lg text-white/80 sm:text-xl">
                            Join thousands of developers who are building and shipping faster with Farouq.
                            No credit card required.
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button
                                size="lg"
                                variant="secondary"
                                asChild
                                className="h-12 px-8 text-base"
                            >
                                <Link href={auth.user ? '/dashboard' : register()}>
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                asChild
                                className="h-12 border-white/30 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
                            >
                                <a href="#pricing">View Pricing</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
