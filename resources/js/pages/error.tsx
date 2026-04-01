import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';

interface ErrorPageProps {
    status: number;
}

const ERROR_MESSAGES: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Access Forbidden',
        description: "You don't have permission to access this page.",
    },
    404: {
        title: 'Page Not Found',
        description:
            "The page you're looking for doesn't exist or has been moved.",
    },
    429: {
        title: 'Too Many Requests',
        description:
            'You have made too many requests. Please wait a moment before trying again.',
    },
    500: {
        title: 'Server Error',
        description:
            "Something went wrong on our end. We've been notified and are working on a fix.",
    },
    503: {
        title: 'Service Unavailable',
        description:
            'The service is temporarily unavailable. Please check back shortly.',
    },
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const error = ERROR_MESSAGES[status] ?? {
        title: 'An Error Occurred',
        description: 'Something unexpected happened.',
    };

    return (
        <>
            <Head title={`${status} — ${error.title}`} />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
                <p className="mb-2 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                    Error {status}
                </p>
                <h1 className="mb-3 text-4xl font-bold tracking-tight">
                    {error.title}
                </h1>
                <p className="mb-8 max-w-md text-base text-muted-foreground">
                    {error.description}
                </p>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>
                    <Button onClick={() => router.visit('/')}>Go Home</Button>
                </div>
            </div>
        </>
    );
}
