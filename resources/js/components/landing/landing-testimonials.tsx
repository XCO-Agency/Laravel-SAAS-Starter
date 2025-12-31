import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import { Github, Quote, Star } from 'lucide-react';

export function LandingTestimonials() {
    const { t } = useTranslations();

    const testimonials = [
        {
            quote: t('landing.testimonials.items.sarah.quote', "Laravel SAAS Starter saved us months of development time. The authentication, billing, and team management were all ready to go. We launched our MVP in just 2 weeks!"),
            author: 'Sarah Chen',
            role: t('landing.testimonials.items.sarah.role', 'CTO at TechFlow'),
            avatar: null,
            rating: 5,
        },
        {
            quote: t('landing.testimonials.items.michael.quote', "The code quality is exceptional. It's clear that experienced Laravel developers built this. The multi-workspace feature was exactly what we needed."),
            author: 'Michael Rodriguez',
            role: t('landing.testimonials.items.michael.role', 'Founder at DataSync'),
            avatar: null,
            rating: 5,
        },
        {
            quote: t('landing.testimonials.items.emily.quote', "Best SaaS starter kit I've used. The Stripe integration worked flawlessly, and the dark mode looks beautiful. Highly recommended!"),
            author: 'Emily Watson',
            role: t('landing.testimonials.items.emily.role', 'Lead Developer at CloudBase'),
            avatar: null,
            rating: 5,
        },
    ];

    const stats = [
        { value: '1,000+', label: t('landing.testimonials.stats.stars', 'GitHub Stars') },
        { value: '50+', label: t('landing.testimonials.stats.features', 'Features') },
        { value: '100%', label: t('landing.testimonials.stats.opensource', 'Open Source') },
        { value: 'MIT', label: t('landing.testimonials.stats.license', 'License') },
    ];

    return (
        <section id="testimonials" className="py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        {t('landing.testimonials.title.part1', 'Loved by')}{' '}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {t('landing.testimonials.title.part2', 'Developers')}
                        </span>{' '}
                        {t('landing.testimonials.title.part3', 'Worldwide')}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t('landing.testimonials.description', "Don't just take our word for it. Here's what developers are saying about Laravel SAAS Starter.")}
                    </p>
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border bg-card p-4 text-center lg:p-6"
                        >
                            <div className="text-2xl font-bold text-primary sm:text-3xl">
                                {stat.value}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Testimonials */}
                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="relative">
                            <CardContent className="pt-6">
                                <Quote className="h-8 w-8 text-primary/20" />

                                {/* Stars */}
                                <div className="mt-4 flex gap-1">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                        />
                                    ))}
                                </div>

                                {/* Quote */}
                                <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                    "{testimonial.quote}"
                                </blockquote>

                                {/* Author */}
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="font-medium">{testimonial.author}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* GitHub Stats */}
                <div className="mt-16">
                    <p className="text-center text-sm text-muted-foreground">
                        {t('landing.testimonials.community.join', 'Join the community')}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
                        <a
                            href="https://github.com/xco-agency/laravel-saas-starter"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                        >
                            <Github className="h-4 w-4" />
                            {t('landing.testimonials.community.star', 'Star on GitHub')}
                        </a>
                        <a
                            href="https://github.com/xco-agency/laravel-saas-starter/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                        >
                            {t('landing.testimonials.community.issues', 'Report Issues')}
                        </a>
                        <a
                            href="https://github.com/xco-agency/laravel-saas-starter/discussions"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                        >
                            {t('landing.testimonials.community.discussions', 'Join Discussions')}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
