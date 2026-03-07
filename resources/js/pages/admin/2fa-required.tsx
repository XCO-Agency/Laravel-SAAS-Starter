import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminTwoFactorRequired() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
            <Head title="Two-Factor Authentication Required" />

            <div className="w-full max-w-md space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                    <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-2xl font-bold tracking-tight">Admin Access Restricted</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        To access the global administration panel, you must secure your account with Two-Factor Authentication (2FA). This is a mandatory security requirement for all super-admin accounts.
                    </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                    <Button className="w-full" size="lg" asChild>
                        <Link href="/settings/two-factor">
                            Enable Two-Factor Authentication
                        </Link>
                    </Button>
                    <Button variant="outline" className="w-full" size="lg" asChild>
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Return to App Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
