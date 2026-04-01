import { TourTooltip } from '@/components/tour-tooltip';
import { useTour } from '@/hooks/use-tour';

export function ProductTour() {
    const { step, steps, visible, next, skip } = useTour();

    if (!visible) {
        return null;
    }

    const currentStep = steps[step];

    if (!currentStep) {
        return null;
    }

    return (
        <TourTooltip
            step={currentStep}
            stepIndex={step}
            totalSteps={steps.length}
            onNext={next}
            onSkip={skip}
        />
    );
}
