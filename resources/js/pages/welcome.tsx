import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Check,
    ChevronDown,
    CreditCard,
    Globe,
    Lock,
    MessageSquare,
    Sparkles,
    Users,
    Zap,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth, name } = usePage<SharedData>().props;
    const { t } = useTranslations();
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

    const features = [
        {
            icon: Building2,
            title: t('welcome.features.multi_workspace.title', 'Multi-Workspace'),
            description: t(
                'welcome.features.multi_workspace.description',
                'Organize your work across multiple projects and clients with dedicated workspaces.',
            ),
        },
        {
            icon: Users,
            title: t('welcome.features.team_collaboration.title', 'Team Collaboration'),
            description: t(
                'welcome.features.team_collaboration.description',
                'Invite team members, assign roles, and collaborate seamlessly on shared projects.',
            ),
        },
        {
            icon: CreditCard,
            title: t('welcome.features.flexible_billing.title', 'Flexible Billing'),
            description: t(
                'welcome.features.flexible_billing.description',
                'Per-workspace billing with flexible plans. Scale each workspace independently.',
            ),
        },
        {
            icon: Lock,
            title: t('welcome.features.enterprise_security.title', 'Enterprise Security'),
            description: t(
                'welcome.features.enterprise_security.description',
                'Two-factor authentication, secure sessions, and granular access controls.',
            ),
        },
        {
            icon: Zap,
            title: t('welcome.features.lightning_fast.title', 'Lightning Fast'),
            description: t(
                'welcome.features.lightning_fast.description',
                'Built on modern technologies for exceptional performance and reliability.',
            ),
        },
        {
            icon: Globe,
            title: t('welcome.features.api_ready.title', 'API Ready'),
            description: t(
                'welcome.features.api_ready.description',
                'Full API access to integrate with your existing tools and workflows.',
            ),
        },
    ];

    const howItWorks = [
        {
            step: t('welcome.how_it_works.step1.number', 'one'),
            title: t('welcome.how_it_works.step1.title', 'Sign Up'),
            description: t(
                'welcome.how_it_works.step1.description',
                'Create your account in seconds. No credit card required.',
            ),
        },
        {
            step: t('welcome.how_it_works.step2.number', 'two'),
            title: t('welcome.how_it_works.step2.title', 'Create Workspace'),
            description: t(
                'welcome.how_it_works.step2.description',
                'Set up your workspace and invite your team members.',
            ),
        },
        {
            step: t('welcome.how_it_works.step3.number', 'three'),
            title: t('welcome.how_it_works.step3.title', 'Start Building'),
            description: t(
                'welcome.how_it_works.step3.description',
                'Begin building your SaaS with all the features you need.',
            ),
        },
    ];

    const testimonials = [
        {
            quote: t(
                'welcome.testimonials.testimonial1.quote',
                'This platform has transformed how we manage our projects. The multi-workspace feature is a game-changer.',
            ),
            author: t('welcome.testimonials.testimonial1.author', 'Sarah Johnson'),
            role: t('welcome.testimonials.testimonial1.role', 'Product Manager'),
        },
        {
            quote: t(
                'welcome.testimonials.testimonial2.quote',
                'The team collaboration features are outstanding. We can now work seamlessly across multiple projects.',
            ),
            author: t('welcome.testimonials.testimonial2.author', 'Michael Chen'),
            role: t('welcome.testimonials.testimonial2.role', 'CTO'),
        },
        {
            quote: t(
                'welcome.testimonials.testimonial3.quote',
                'Best decision we made. The billing system is flexible and the security features give us peace of mind.',
            ),
            author: t('welcome.testimonials.testimonial3.author', 'Emily Rodriguez'),
            role: t('welcome.testimonials.testimonial3.role', 'Founder'),
        },
    ];

    const faqs = [
        {
            question: t('welcome.faq.question1', 'What features are included?'),
            answer: t(
                'welcome.faq.answer1',
                'All plans include multi-workspace support, team collaboration, flexible billing, enterprise security, and API access. Premium plans unlock additional features like advanced analytics and custom integrations.',
            ),
        },
        {
            question: t('welcome.faq.question2', 'Can I change plans later?'),
            answer: t(
                'welcome.faq.answer2',
                'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated.',
            ),
        },
        {
            question: t('welcome.faq.question3', 'What payment methods do you accept?'),
            answer: t(
                'welcome.faq.answer3',
                'We accept all major credit cards (Visa, MasterCard, American Express) through our secure payment processor, Stripe.',
            ),
        },
        {
            question: t('welcome.faq.question4', 'Can I cancel my subscription?'),
            answer: t(
                'welcome.faq.answer4',
                'Yes, you can cancel your subscription at any time. You will continue to have access to paid features until the end of your billing period.',
            ),
        },
        {
            question: t('welcome.faq.question5', 'Is there a free trial?'),
            answer: t(
                'welcome.faq.answer5',
                'Yes! We offer a free plan that includes 1 workspace and 1 team member. You can upgrade at any time to unlock more features.',
            ),
        },
    ];

    const plans = [
        {
            id: 'free',
            name: t('welcome.plans.free.name', 'Free'),
            description: t('welcome.plans.free.description', 'Perfect for getting started'),
            price: { monthly: 0, yearly: 0 },
            features: [
                t('welcome.plans.free.features.workspace', '1 workspace'),
                t('welcome.plans.free.features.member', '1 team member'),
                t('welcome.plans.free.features.features', 'Basic features'),
                t('welcome.plans.free.features.support', 'Community support'),
            ],
            popular: false,
        },
        {
            id: 'pro',
            name: t('welcome.plans.pro.name', 'Pro'),
            description: t('welcome.plans.pro.description', 'For growing teams'),
            price: { monthly: 29, yearly: 290 },
            features: [
                t('welcome.plans.pro.features.workspaces', '5 workspaces'),
                t('welcome.plans.pro.features.members', '5 team members per workspace'),
                t('welcome.plans.pro.features.features', 'All features'),
                t('welcome.plans.pro.features.support', 'Priority support'),
                t('welcome.plans.pro.features.analytics', 'Advanced analytics'),
            ],
            popular: true,
        },
        {
            id: 'business',
            name: t('welcome.plans.business.name', 'Business'),
            description: t('welcome.plans.business.description', 'For larger organizations'),
            price: { monthly: 99, yearly: 990 },
            features: [
                t('welcome.plans.business.features.workspaces', 'Unlimited workspaces'),
                t('welcome.plans.business.features.members', 'Unlimited team members'),
                t('welcome.plans.business.features.features', 'All features'),
                t('welcome.plans.business.features.support', 'Dedicated support'),
                t('welcome.plans.business.features.integrations', 'Custom integrations'),
                t('welcome.plans.business.features.sla', 'SLA guarantee'),
            ],
            popular: false,
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700&family=bricolage-grotesque:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 overflow-x-hidden">
                {/* Navigation */}
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md"
                >
                    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2">
                            <AppLogoIcon className="h-8 w-8" />
                            <span
                                className="text-xl font-bold"
                                style={{
                                    fontFamily: 'Bricolage Grotesque, sans-serif',
                                }}
                            >
                                {name}
                            </span>
                        </Link>

                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href="/dashboard">
                                        {t('navigation.dashboard', 'Dashboard')}
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href="/login">
                                            {t('auth.sign_in', 'Sign In')}
                                        </Link>
                                    </Button>
                                    {canRegister && (
                                        <Button asChild>
                                            <Link href="/register">
                                                {t('welcome.start_free_trial', 'Get Started')}
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </motion.header>

                {/* Hero Section */}
                <motion.section
                    ref={heroRef}
                    style={{ opacity, y }}
                    className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32"
                >
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
                        <motion.div
                            className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl"
                            aria-hidden="true"
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            <div
                                className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary/40 via-accent/30 to-secondary/40 opacity-40"
                                style={{
                                    clipPath:
                                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                }}
                            />
                        </motion.div>
                    </div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mx-auto max-w-3xl text-center"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <Badge variant="secondary" className="mb-6">
                                    <Sparkles className="mr-1 h-3 w-3" />
                                    {t('welcome.beta_badge', 'Now in Beta')}
                                </Badge>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="comic-text text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                                style={{
                                    fontFamily: 'Bricolage Grotesque, sans-serif',
                                    fontWeight: 900,
                                }}
                            >
                                {t('welcome.title', 'Build your SaaS faster than ever')}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="mt-6 text-lg text-muted-foreground sm:text-xl"
                            >
                                {t(
                                    'welcome.subtitle',
                                    'The complete foundation for your next SaaS application. Multi-tenancy, team management, billing, and authentication — all out of the box.',
                                )}
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                            >
                                {auth.user ? (
                                    <Button size="lg" asChild>
                                        <Link href="/dashboard">
                                            {t('welcome.go_to_dashboard', 'Go to Dashboard')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button size="lg" asChild>
                                            <Link href="/register">
                                                {t('welcome.start_free_trial', 'Start Free Trial')}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button size="lg" variant="outline" asChild>
                                            <a href="#pricing">
                                                {t('welcome.view_pricing', 'View Pricing')}
                                            </a>
                                        </Button>
                                    </>
                                )}
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                                className="mt-4 text-sm text-muted-foreground"
                            >
                                {t('welcome.no_credit_card', '* no credit card required.')}
                            </motion.p>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Features Section */}
                <motion.section
                    id="features"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className="py-20 sm:py-32"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={itemVariants}
                            className="mx-auto max-w-2xl text-center"
                        >
                            <h2
                                className="comic-text text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                                style={{
                                    fontFamily: 'Bricolage Grotesque, sans-serif',
                                }}
                            >
                                {t('welcome.features_title', 'Everything you need to build')}
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground font-semibold">
                                {t(
                                    'welcome.features_description',
                                    'A complete foundation with all the features your SaaS needs from day one.',
                                )}
                            </p>
                        </motion.div>

                        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <motion.div key={feature.title} variants={itemVariants}>
                                    <Card className="relative overflow-hidden transition-all hover:shadow-2xl hover:scale-105 border-2 border-primary/20">
                                        <CardHeader>
                                            <motion.div
                                                whileHover={{ scale: 1.2, rotate: 10 }}
                                                className={`mb-2 flex h-14 w-14 items-center justify-center rounded-xl ${
                                                    index % 3 === 0
                                                        ? 'gradient-marvel-blue'
                                                        : index % 3 === 1
                                                          ? 'gradient-marvel-red'
                                                          : 'gradient-marvel-yellow'
                                                } shadow-lg`}
                                            >
                                                <feature.icon className="h-7 w-7 text-white" />
                                            </motion.div>
                                            <CardTitle className="text-xl font-bold">
                                                {feature.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-base">
                                                {feature.description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* How It Works Section */}
                <motion.section
                    id="how-it-works"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className="py-20 sm:py-32"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={itemVariants}
                            className="mx-auto max-w-2xl text-center"
                        >
                            <h2
                                className="comic-text text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                                style={{
                                    fontFamily: 'Bricolage Grotesque, sans-serif',
                                }}
                            >
                                {t('welcome.how_it_works.title', 'How it works')}
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground font-semibold">
                                {t(
                                    'welcome.how_it_works.description',
                                    "Can't get any easier",
                                )}
                            </p>
                        </motion.div>

                        <div className="mt-16 grid gap-8 sm:grid-cols-3">
                            {howItWorks.map((step, index) => (
                                <motion.div
                                    key={step.step}
                                    variants={itemVariants}
                                    className="text-center"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.15, rotate: 5 }}
                                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full gradient-marvel-blue text-3xl font-black text-white shadow-lg border-4 border-white"
                                    >
                                        {index + 1}
                                    </motion.div>
                                    <h3 className="text-xl font-bold">{step.title}</h3>
                                    <p className="mt-2 text-muted-foreground">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Time-Based Storytelling Section - Marvel Style */}
                <motion.section
                    id="your-day"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className="py-20 sm:py-32 bg-gradient-to-b from-muted/50 to-background"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={itemVariants}
                            className="mx-auto max-w-2xl text-center mb-16"
                        >
                            <h2
                                className="comic-text text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                                style={{
                                    fontFamily: 'Bricolage Grotesque, sans-serif',
                                }}
                            >
                                {t('welcome.your_day.title', 'WELCOME TO YOUR NEW LIFE')}
                            </h2>
                        </motion.div>

                        <div className="space-y-12">
                            {[
                                {
                                    time: t('welcome.your_day.morning.time', '7:00 AM'),
                                    title: t('welcome.your_day.morning.title', 'Your workspace is ready'),
                                    emoji: '☕',
                                    description: t(
                                        'welcome.your_day.morning.description',
                                        'The day begins. You open your dashboard, ready for the usual chaos. But it\'s organized. Your workspace is already set up, teams are configured, and everything is ready to go. The chaos is gone before you even take your first sip.',
                                    ),
                                    gradient: 'gradient-marvel-blue',
                                },
                                {
                                    time: t('welcome.your_day.noon.time', '11:00 AM'),
                                    title: t('welcome.your_day.noon.title', 'Team collaboration in full swing'),
                                    emoji: '📱',
                                    description: t(
                                        'welcome.your_day.noon.description',
                                        'Your team is collaborating seamlessly. Invitations are sent, roles are assigned, and projects are moving forward. All you do is approve and move on.',
                                    ),
                                    gradient: 'gradient-marvel-yellow',
                                },
                                {
                                    time: t('welcome.your_day.afternoon.time', '2:00 PM'),
                                    title: t('welcome.your_day.afternoon.title', 'Billing handled automatically'),
                                    emoji: '💳',
                                    description: t(
                                        'welcome.your_day.afternoon.description',
                                        'While you\'re focused on building, billing is handled automatically. Subscriptions are managed, invoices are generated, and payments are processed seamlessly.',
                                    ),
                                    gradient: 'gradient-marvel-red',
                                },
                                {
                                    time: t('welcome.your_day.evening.time', '5:00 PM'),
                                    title: t('welcome.your_day.evening.title', 'Security never sleeps'),
                                    emoji: '🔒',
                                    description: t(
                                        'welcome.your_day.evening.description',
                                        'Your security is always on. Two-factor authentication, secure sessions, and granular access controls keep your data safe while you focus on what matters.',
                                    ),
                                    gradient: 'gradient-marvel-purple',
                                },
                            ].map((moment, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="comic-panel rounded-2xl p-8 sm:p-12"
                                >
                                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                                        <div className="flex-shrink-0">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: -5 }}
                                                className={`${moment.gradient} w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg border-4 border-white`}
                                            >
                                                {moment.emoji}
                                            </motion.div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <span className="text-2xl font-black text-primary">
                                                    {moment.time}
                                                </span>
                                                <h3 className="text-2xl font-bold">
                                                    {moment.title}
                                                </h3>
                                            </div>
                                            <p className="text-lg text-muted-foreground leading-relaxed">
                                                {moment.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Testimonials Section */}
                <motion.section
                    id="testimonials"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className="py-20 sm:py-32"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={itemVariants}
                            className="mx-auto max-w-2xl text-center"
                        >
                            <h2
                                className="comic-text text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                                style={{
                                    fontFamily: 'Bricolage Grotesque, sans-serif',
                                }}
                            >
                                {t('welcome.testimonials.title', 'Customers love it')}
                            </h2>
                        </motion.div>

                        <div className="mt-16 grid gap-8 sm:grid-cols-3">
                            {testimonials.map((testimonial, index) => (
                                <motion.div key={index} variants={itemVariants}>
                                    <Card className="h-full border-2 border-primary/20 hover:shadow-xl transition-all">
                                        <CardContent className="pt-6">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                                                    index % 3 === 0
                                                        ? 'gradient-marvel-blue'
                                                        : index % 3 === 1
                                                          ? 'gradient-marvel-red'
                                                          : 'gradient-marvel-yellow'
                                                } shadow-lg`}
                                            >
                                                <MessageSquare className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <blockquote className="text-lg font-semibold leading-relaxed">
                                                "{testimonial.quote}"
                                            </blockquote>
                                            <div className="mt-4">
                                                <p className="font-bold text-primary">
                                                    {testimonial.author}
                                                </p>
                                                <p className="text-sm text-muted-foreground font-medium">
                                                    {testimonial.role}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Try Before You Subscribe Section */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className="py-20 sm:py-32"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={itemVariants}
                            className="relative overflow-hidden rounded-3xl gradient-marvel-blue px-6 py-20 sm:px-12 sm:py-28 shadow-2xl border-4 border-white"
                        >
                            <div className="bg-grid-white/10 absolute inset-0 [mask-image:radial-gradient(white,transparent_70%)]" />
                            <div className="relative mx-auto max-w-2xl text-center">
                                <h2
                                    className="comic-text text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
                                    style={{
                                        fontFamily: 'Bricolage Grotesque, sans-serif',
                                    }}
                                >
                                    {t(
                                        'welcome.try_before.title',
                                        'Try Before You Subscribe',
                                    )}
                                </h2>
                                <p className="mt-4 text-lg text-white/90 font-semibold">
                                    {t(
                                        'welcome.try_before.description',
                                        'Get started with our free plan and upgrade when you are ready. No credit card required.',
                                    )}
                                </p>
                                <div className="mt-8">
                                    <Button size="lg" variant="secondary" className="font-bold shadow-lg" asChild>
                                        <Link href="/register">
                                            {t('welcome.start_free_trial', 'Start Free Trial')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* FAQ Section */}
                <motion.section
                    id="faq"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className="py-20 sm:py-32"
                >
                    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={itemVariants}
                            className="mx-auto max-w-2xl text-center"
                        >
                            <h2
                                className="comic-text text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                                style={{
                                    fontFamily: 'Bricolage Grotesque, sans-serif',
                                }}
                            >
                                {t('welcome.faq.title', 'Got a Question?')}
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground font-semibold">
                                {t(
                                    'welcome.faq.description',
                                    'Here is a list of the most common questions to help you with your decision.',
                                )}
                            </p>
                        </motion.div>

                        <div className="mt-16 space-y-4">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="overflow-hidden rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-all"
                                >
                                    <button
                                        onClick={() =>
                                            setActiveFaq(activeFaq === index ? null : index)
                                        }
                                        className="flex w-full items-center justify-between p-6 text-left"
                                    >
                                        <span className="font-semibold">{faq.question}</span>
                                        <motion.div
                                            animate={{
                                                rotate: activeFaq === index ? 180 : 0,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown className="h-5 w-5" />
                                        </motion.div>
                                    </button>
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: activeFaq === index ? 'auto' : 0,
                                            opacity: activeFaq === index ? 1 : 0,
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 text-muted-foreground">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Pricing Section */}
                <motion.section
                    id="pricing"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className="py-20 sm:py-32"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={itemVariants}
                            className="mx-auto max-w-2xl text-center"
                        >
                            <h2
                                className="comic-text text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                                style={{
                                    fontFamily: 'Bricolage Grotesque, sans-serif',
                                }}
                            >
                                {t('welcome.pricing_title', 'Simple, transparent pricing')}
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground font-semibold">
                                {t(
                                    'welcome.pricing_description',
                                    "Choose the plan that's right for you. Upgrade or downgrade at any time.",
                                )}
                            </p>
                        </motion.div>

                        <div className="mt-16 grid gap-8 lg:grid-cols-3">
                            {plans.map((plan) => (
                                <motion.div key={plan.id} variants={itemVariants}>
                                    <Card
                                        className={`relative flex flex-col transition-all hover:shadow-2xl hover:scale-105 border-4 ${
                                            plan.popular
                                                ? 'border-primary shadow-2xl gradient-marvel-blue/10'
                                                : 'border-primary/20'
                                        }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <Badge>
                                                    <Sparkles className="mr-1 h-3 w-3" />
                                                    {t('welcome.plans.most_popular', 'Most Popular')}
                                                </Badge>
                                            </div>
                                        )}
                                        <CardHeader className="text-center">
                                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                                            <CardDescription>{plan.description}</CardDescription>
                                            <div className="mt-4">
                                                <span className="text-4xl font-bold">
                                                    ${plan.price.monthly}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {t('welcome.plans.per_month', '/month')}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <ul className="space-y-3">
                                                {plan.features.map((feature) => (
                                                    <li
                                                        key={feature}
                                                        className="flex items-start gap-2 text-sm"
                                                    >
                                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                variant={
                                                    plan.popular ? 'default' : 'outline'
                                                }
                                                className="w-full"
                                                asChild
                                            >
                                                <Link href="/register">
                                                    {t('welcome.plans.get_started', 'Get Started')}
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* CTA Section */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className="py-20 sm:py-32"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={itemVariants}
                            className="relative overflow-hidden rounded-3xl gradient-marvel-red px-6 py-20 sm:px-12 sm:py-28 shadow-2xl border-4 border-white"
                        >
                            <div className="bg-grid-white/10 absolute inset-0 [mask-image:radial-gradient(white,transparent_70%)]" />
                            <div className="relative mx-auto max-w-2xl text-center">
                                <h2
                                    className="comic-text text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
                                    style={{
                                        fontFamily: 'Bricolage Grotesque, sans-serif',
                                    }}
                                >
                                    {t('welcome.ready_to_get_started', 'Ready to get started?')}
                                </h2>
                                <p className="mt-4 text-lg text-white/90 font-semibold">
                                    {t(
                                        'welcome.ready_description',
                                        'Start building your SaaS today with our complete foundation. No credit card required.',
                                    )}
                                </p>
                                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Button size="lg" variant="secondary" className="font-bold shadow-lg" asChild>
                                        <Link href="/register">
                                            {t('welcome.start_free_trial', 'Start Free Trial')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Footer */}
                <footer className="border-t py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <AppLogoIcon className="h-6 w-6" />
                                <span className="font-semibold">{name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                © {new Date().getFullYear()} {name}.{' '}
                                {t('welcome.copyright', 'All rights reserved.')}
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
