import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/hooks/use-translations';
import { Link } from '@inertiajs/react';
import { CheckCircle2, Circle, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ChecklistStep {
    id: string;
    label: string;
    description: string;
    completed: boolean;
    href: string;
}

interface ChecklistData {
    dismissed: boolean;
    steps: ChecklistStep[];
    completed: number;
    total: number;
}

export function OnboardingChecklist() {
    const { t } = useTranslations();
    const [data, setData] = useState<ChecklistData | null>(null);
    const [dismissing, setDismissing] = useState(false);
    const [hidden, setHidden] = useState(false);

    const fetchChecklist = async () => {
        try {
            const response = await fetch('/onboarding-checklist', {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            if (response.ok) {
                const result = await response.json();
                setData(result);
                if (result.dismissed) {
                    setHidden(true);
                }
            }
        } catch {
            // Silently fail — checklist is non-critical
        }
    };

    const dismiss = async () => {
        setDismissing(true);
        try {
            await fetch('/onboarding-checklist/dismiss', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            setHidden(true);
        } catch {
            // Silently fail
        } finally {
            setDismissing(false);
        }
    };

    useEffect(() => {
        fetchChecklist();
    }, []);

    if (hidden || !data || data.dismissed || data.steps.length === 0) {
        return null;
    }

    const progress = Math.round((data.completed / data.total) * 100);
    const allComplete = data.completed === data.total;

    return (
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
            <div className="absolute top-0 right-0 h-32 w-32 transform translate-x-8 -translate-y-8">
                <div className="h-full w-full rounded-full bg-primary/5" />
            </div>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">
                            {t('onboarding.checklist.title', 'Get started')}
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={dismiss}
                        disabled={dismissing}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Dismiss</span>
                    </Button>
                </div>
                <CardDescription>
                    {allComplete
                        ? t('onboarding.checklist.complete', "You're all set! Your workspace is fully configured.")
                        : t('onboarding.checklist.description', 'Complete these steps to get the most out of your workspace.')}
                </CardDescription>
                <div className="flex items-center gap-3 pt-2">
                    <Progress value={progress} className="h-2 flex-1" />
                    <span className="text-sm font-medium text-muted-foreground">
                        {data.completed}/{data.total}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="space-y-3">
                    {data.steps.map((step) => (
                        <Link
                            key={step.id}
                            href={step.href}
                            className={`flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50 ${step.completed
                                ? 'border-primary/20 bg-primary/5'
                                : 'border-border hover:border-primary/30'
                                }`}
                        >
                            {step.completed ? (
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                            ) : (
                                <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                            )}
                            <div className="min-w-0 flex-1">
                                <p
                                    className={`text-sm font-medium ${step.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                                        }`}
                                >
                                    {step.label}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
