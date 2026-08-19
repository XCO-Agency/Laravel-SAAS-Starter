import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useState } from 'react';

export function ExperienceFeedbackModal() {
    const { t } = useTranslations();
    const showSurvey = usePage().props.show_experience_survey === true;

    const [open, setOpen] = useState(showSurvey);
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [message, setMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!showSurvey) {
        return null;
    }

    const dismiss = () => {
        setOpen(false);
        router.post(
            '/experience-feedback/dismiss',
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const submit = () => {
        if (rating < 1) {
            setError(t('feedback.experience.rating_required'));
            return;
        }

        setProcessing(true);
        setError(null);

        router.post(
            '/experience-feedback',
            { rating, message },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setOpen(false),
                onError: (errors) => {
                    setError(
                        errors.rating ??
                            errors.message ??
                            t('feedback.experience.error'),
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            dismiss();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('feedback.experience.title')}</DialogTitle>
                    <DialogDescription>
                        {t('feedback.experience.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div
                        className="flex items-center justify-center gap-1"
                        onMouseLeave={() => setHovered(0)}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                aria-label={t('feedback.experience.star_label', {
                                    rating: value,
                                })}
                                onMouseEnter={() => setHovered(value)}
                                onClick={() => {
                                    setRating(value);
                                    setError(null);
                                }}
                                className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <Star
                                    className={cn(
                                        'h-8 w-8',
                                        (hovered || rating) >= value
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-muted-foreground',
                                    )}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="experience-feedback-message">
                            {t('feedback.experience.message_label')}
                        </Label>
                        <Textarea
                            id="experience-feedback-message"
                            value={message}
                            maxLength={2000}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t(
                                'feedback.experience.message_placeholder',
                            )}
                            rows={3}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={dismiss}
                        disabled={processing}
                    >
                        {t('feedback.experience.skip')}
                    </Button>
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={processing}
                    >
                        {t('feedback.experience.submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
