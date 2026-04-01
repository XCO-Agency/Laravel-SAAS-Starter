import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export interface TourStep {
    target: string;
    title: string;
    description: string;
}

const TOUR_STEPS: TourStep[] = [
    {
        target: '#dashboard-main',
        title: 'Your Dashboard',
        description:
            'This is your workspace dashboard. Get a quick overview of your plan, team, and recent activity at a glance.',
    },
    {
        target: '[data-tour="workspace-switcher"]',
        title: 'Workspace Switcher',
        description:
            'Switch between workspaces, create new ones, or access workspace settings from this menu.',
    },
    {
        target: '[data-tour="nav-usage"]',
        title: 'Usage & Analytics',
        description:
            'Track your workspace usage, view activity logs, and monitor your plan limits here.',
    },
    {
        target: '[data-tour="user-menu"]',
        title: 'Your Account',
        description:
            'Access your profile settings, billing, team management, and support tickets from this menu.',
    },
];

export function useTour() {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const complete = useCallback(() => {
        router.post(
            '/tour/complete',
            {},
            { preserveState: true, preserveScroll: true },
        );
        setVisible(false);
    }, []);

    const next = useCallback(() => {
        if (step < TOUR_STEPS.length - 1) {
            setStep((s) => s + 1);
        } else {
            complete();
        }
    }, [step, complete]);

    const skip = useCallback(() => {
        complete();
    }, [complete]);

    // Get current step info
    const currentStep = TOUR_STEPS[step];

    // Check if current step's target exists
    const currentTargetExists =
        mounted && typeof document !== 'undefined'
            ? document.querySelector(currentStep.target) !== null
            : false;

    return {
        step,
        steps: TOUR_STEPS,
        visible: visible && mounted,
        next,
        skip,
        complete,
        currentStep,
        currentTargetExists,
    };
}
