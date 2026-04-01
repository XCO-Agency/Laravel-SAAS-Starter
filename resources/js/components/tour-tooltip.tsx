import { Button } from '@/components/ui/button';
import { type TourStep } from '@/hooks/use-tour';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TourTooltipProps {
    step: TourStep;
    stepIndex: number;
    totalSteps: number;
    onNext: () => void;
    onSkip: () => void;
}

interface Position {
    top: number;
    left: number;
}

export function TourTooltip({
    step,
    stepIndex,
    totalSteps,
    onNext,
    onSkip,
}: TourTooltipProps) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [targetFound, setTargetFound] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Reset state when step changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTargetFound(false);
        setTargetRect(null);
        setRetryCount(0);
        setPosition({ top: 0, left: 0 });
    }, [step.target]);

    useEffect(() => {
        const findTarget = () => {
            const target = document.querySelector(step.target);

            if (!target) {
                // Retry up to 10 times with 100ms delay
                if (retryCount < 10) {
                    setTimeout(() => setRetryCount((c) => c + 1), 100);
                }
                return;
            }

            setTargetFound(true);
            const rect = target.getBoundingClientRect();
            setTargetRect(rect);

            const tooltipWidth = 320;
            const tooltipHeight = 180;
            const gap = 12;

            let top = rect.bottom + gap + window.scrollY;
            let left = rect.left + window.scrollX;

            // Prevent tooltip from going off-screen right
            if (left + tooltipWidth > window.innerWidth - gap) {
                left = window.innerWidth - tooltipWidth - gap;
            }

            // Prevent tooltip from going off-screen left
            if (left < gap) {
                left = gap;
            }

            // If tooltip would go below viewport, position it above the target
            if (
                top + tooltipHeight >
                window.scrollY + window.innerHeight - gap
            ) {
                top = rect.top - tooltipHeight - gap + window.scrollY;
            }

            setPosition({ top, left });

            // Smooth scroll to target
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        findTarget();
    }, [step, retryCount]);

    const isLastStep = stepIndex === totalSteps - 1;

    // If target not found after retries, show centered tooltip
    if (!targetFound && retryCount >= 10) {
        return (
            <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40 bg-black/40" />

                {/* Centered Tooltip */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        ref={tooltipRef}
                        className="w-80 rounded-xl border bg-card p-4 shadow-xl"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                {Array.from({ length: totalSteps }).map(
                                    (_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                                i === stepIndex
                                                    ? 'bg-primary'
                                                    : 'bg-muted-foreground/30'
                                            }`}
                                        />
                                    ),
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={onSkip}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <h3 className="mb-1 font-semibold">{step.title}</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            {step.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={onSkip}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Skip tour
                            </button>
                            <Button onClick={onNext} size="sm">
                                {isLastStep ? 'Done' : 'Next →'}
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div className="pointer-events-none fixed inset-0 z-40 bg-black/40" />

            {/* Highlight ring around target */}
            {targetRect && (
                <div
                    className="pointer-events-none fixed z-50 rounded-lg ring-2 ring-primary ring-offset-2"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                    }}
                />
            )}

            {/* Tooltip card */}
            <div
                ref={tooltipRef}
                className="fixed z-50 w-80 rounded-xl border bg-card p-4 shadow-xl"
                style={{ top: position.top, left: position.left }}
            >
                {/* Progress dots */}
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                    i === stepIndex
                                        ? 'bg-primary'
                                        : 'bg-muted-foreground/30'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {stepIndex + 1} of {totalSteps}
                    </span>
                </div>

                <h3 className="mb-1 font-semibold">{step.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                    {step.description}
                </p>

                <div className="flex items-center justify-between">
                    <button
                        onClick={onSkip}
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Skip tour
                    </button>
                    <Button onClick={onNext} size="sm">
                        {isLastStep ? 'Done' : 'Next →'}
                    </Button>
                </div>
            </div>
        </>
    );
}
