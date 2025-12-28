import {
    LandingCta,
    LandingFaq,
    LandingFeatures,
    LandingFooter,
    LandingHeader,
    LandingHero,
    LandingPricing,
    LandingTestimonials,
} from '@/components/landing';
import { Head } from '@inertiajs/react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    return (
        <>
            <Head title="Laravel SAAS Starter - Launch Your SaaS 10x Faster">
                <meta
                    name="description"
                    content="Laravel SAAS Starter is a production-ready Laravel SaaS starter kit with authentication, billing, teams, and everything you need to launch faster. Built by XCO Agency."
                />
                <meta
                    name="keywords"
                    content="laravel, saas, starter kit, boilerplate, authentication, stripe, billing, teams"
                />
                <meta property="og:title" content="Laravel SAAS Starter - Launch Your SaaS 10x Faster" />
                <meta
                    property="og:description"
                    content="Production-ready Laravel SaaS starter kit. 100% free and open source. Launch your SaaS 10x faster with authentication, billing, teams, and more."
                />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Laravel SAAS Starter - Launch Your SaaS 10x Faster" />
                <meta
                    name="twitter:description"
                    content="Production-ready Laravel SaaS starter kit by XCO Agency."
                />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground">
                <LandingHeader canRegister={canRegister} />
                <main>
                    <LandingHero />
                    <LandingFeatures />
                    <LandingPricing />
                    <LandingTestimonials />
                    <LandingFaq />
                    <LandingCta />
                </main>
                <LandingFooter />
            </div>
        </>
    );
}
