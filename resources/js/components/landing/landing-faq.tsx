import { useState } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { ChevronDown } from 'lucide-react';

export function LandingFaq() {
    const { t } = useTranslations();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: t('landing.faq.items.what_is.question', 'What is Laravel SAAS Starter?'),
            answer: t('landing.faq.items.what_is.answer', 'Laravel SAAS Starter is a production-ready Laravel SaaS starter kit that includes authentication, multi-tenant workspaces, team management, Stripe billing, and more. It helps you launch your SaaS product 10x faster by providing all the essential features out of the box. Built by XCO Agency.'),
        },
        {
            question: t('landing.faq.items.tech_stack.question', 'What tech stack does Laravel SAAS Starter use?'),
            answer: t('landing.faq.items.tech_stack.answer', 'Laravel SAAS Starter is built with Laravel 12, Inertia.js v2, React 19, and Tailwind CSS v4. It uses Laravel Fortify for authentication, Laravel Cashier for Stripe billing, and shadcn/ui-inspired components for the UI.'),
        },
        {
            question: t('landing.faq.items.multiple_projects.question', 'Can I use Laravel SAAS Starter for multiple projects?'),
            answer: t('landing.faq.items.multiple_projects.answer', 'Yes! Laravel SAAS Starter is open source and free to use for unlimited personal and commercial projects. There are no per-project fees or royalties.'),
        },
        {
            question: t('landing.faq.items.production_ready.question', 'Is Laravel SAAS Starter suitable for production?'),
            answer: t('landing.faq.items.production_ready.answer', 'Absolutely. Laravel SAAS Starter is built with production in mind, following Laravel best practices, security guidelines, and performance optimizations. Many successful SaaS products are already running on Laravel SAAS Starter.'),
        },
        {
            question: t('landing.faq.items.customization.question', 'How do I customize the design?'),
            answer: t('landing.faq.items.customization.answer', 'Laravel SAAS Starter uses Tailwind CSS v4 with a well-organized theme system. You can easily customize colors, fonts, and spacing through the CSS variables. All components are built with shadcn/ui patterns, making them easy to modify.'),
        },
        {
            question: t('landing.faq.items.support.question', 'Do you offer support?'),
            answer: t('landing.faq.items.support.answer', 'Yes! We provide community support through GitHub Discussions and Issues. You can ask questions, report bugs, or request features. The community is very active and helpful.'),
        },
        {
            question: t('landing.faq.items.getting_started.question', 'How do I get started?'),
            answer: t('landing.faq.items.getting_started.answer', 'Getting started is easy! Clone the repository, follow the installation instructions in the README, and you\'ll have a fully functional SaaS application running in minutes. No complex setup required.'),
        },
    ];

    return (
        <section id="faq" className="py-20 sm:py-32 bg-muted/30">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        {t('landing.faq.title.part1', 'Frequently Asked')}{' '}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {t('landing.faq.title.part2', 'Questions')}
                        </span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t('landing.faq.description', "Everything you need to know about Laravel SAAS Starter. Can't find the answer you're looking for? Contact our support team.")}
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="mt-12 space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-xl border bg-card"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors sm:p-6"
                            >
                                <span>{faq.question}</span>
                                <ChevronDown
                                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            <div
                                className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <p className="px-4 pb-4 text-muted-foreground sm:px-6 sm:pb-6">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
