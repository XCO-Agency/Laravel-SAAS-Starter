import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface TourStep {
    target: string;
    title: string;
    description: string;
}

const TOUR_STEPS: TourStep[] = [
    {
        target: '#dashboard-main',
        title: 'Your Dashboard',
        description: 'This is your workspace dashboard. Get a quick overview of your plan, team, and recent activity at a glance.',
    },
    {
        target: '#nav-team',
        title: 'Manage Your Team',
        description: 'Invite team members, assign roles, and control access to your workspace from the Team section.',
    },
    {
        target: '#nav-billing',
        title: 'Billing & Plans',
        description: 'View your current plan, upgrade for more features, and manage invoices in the Billing section.',
    },
    {
        target: '#nav-settings',
        title: 'Workspace Settings',
        description: 'Customise your workspace name, branding, security policies, and much more in Settings.',
    },
];

export function useTour() {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);

    const complete = () => {
        router.post('/tour/complete', {}, { preserveState: true, preserveScroll: true });
        setVisible(false);
    };

    const next = () => {
        if (step < TOUR_STEPS.length - 1) {
            setStep((s) => s + 1);
        } else {
            complete();
        }
    };

    return {
        step,
        steps: TOUR_STEPS,
        visible,
        next,
        skip: complete,
        complete,
    };
}
