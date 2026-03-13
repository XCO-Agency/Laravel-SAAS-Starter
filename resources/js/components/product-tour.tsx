import { TourTooltip } from '@/components/tour-tooltip';
import { useTour } from '@/hooks/use-tour';

export function ProductTour() {
    const { step, steps, visible, next, skip } = useTour();

    if (!visible) {
        return null;
    }

    return (
        <TourTooltip
            step={steps[step]}
            stepIndex={step}
            totalSteps={steps.length}
            onNext={next}
            onSkip={skip}
        />
    );
}
