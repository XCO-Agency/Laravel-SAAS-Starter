import { useEffect, useRef, useState } from 'react';
import { type TourStep } from '@/hooks/use-tour';

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

export function TourTooltip({ step, stepIndex, totalSteps, onNext, onSkip }: TourTooltipProps) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const target = document.querySelector(step.target);

        if (!target) {
            return;
        }

        const rect = target.getBoundingClientRect();
        setTargetRect(rect);

        const tooltipWidth = 320;
        const tooltipHeight = 180;
        const gap = 12;

        let top = rect.bottom + gap + window.scrollY;
        let left = rect.left + window.scrollX;

        if (left + tooltipWidth > window.innerWidth - gap) {
            left = window.innerWidth - tooltipWidth - gap;
        }

        if (left < gap) {
            left = gap;
        }

        if (top + tooltipHeight > window.scrollY + window.innerHeight - gap) {
            top = rect.top - tooltipHeight - gap + window.scrollY;
        }

        setPosition({ top, left });
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [step]);

    const isLastStep = stepIndex === totalSteps - 1;

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
                                    i === stepIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {stepIndex + 1} of {totalSteps}
                    </span>
                </div>

                <h3 className="mb-1 font-semibold">{step.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{step.description}</p>

                <div className="flex items-center justify-between">
                    <button
                        onClick={onSkip}
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Skip tour
                    </button>
                    <button
                        onClick={onNext}
                        className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        {isLastStep ? 'Done' : 'Next →'}
                    </button>
                </div>
            </div>
        </>
    );
}
