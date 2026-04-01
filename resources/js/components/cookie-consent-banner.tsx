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
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';

export type CookiePreferences = {
    necessary: boolean;
    analytical: boolean;
    marketing: boolean;
};

const DEFAULT_PREFERENCES: CookiePreferences = {
    necessary: true,
    analytical: false,
    marketing: false,
};

export function useCookieConsent() {
    const [preferences, setPreferences] = useState<CookiePreferences | null>(
        null,
    );
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('cookie-consent');
        if (stored) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setPreferences(JSON.parse(stored));
            } catch {
                // Return null if parsing fails
            }
        }
        setIsLoaded(true);
    }, []);

    const savePreferences = (newPrefs: CookiePreferences) => {
        // Ensures 'necessary' is always true
        const prefsToSave = { ...newPrefs, necessary: true };
        localStorage.setItem('cookie-consent', JSON.stringify(prefsToSave));
        setPreferences(prefsToSave);

        // Dispatch a custom event so other components or analytical scripts can react
        window.dispatchEvent(
            new CustomEvent('cookie-consent-updated', { detail: prefsToSave }),
        );
    };

    return { preferences, isLoaded, savePreferences };
}

export default function CookieConsentBanner() {
    const { preferences, isLoaded, savePreferences } = useCookieConsent();
    const [showBanner, setShowBanner] = useState(false);
    const [showManager, setShowManager] = useState(false);

    // Local state for the manager modal while editing
    const [tempPrefs, setTempPrefs] =
        useState<CookiePreferences>(DEFAULT_PREFERENCES);

    useEffect(() => {
        if (isLoaded && preferences === null) {
            // Give a small delay before showing the banner to let the page load
            const timer = setTimeout(() => setShowBanner(true), 500);
            return () => clearTimeout(timer);
        } else if (isLoaded && preferences !== null) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowBanner(false);
        }
    }, [isLoaded, preferences]);

    const handleAcceptAll = () => {
        savePreferences({
            necessary: true,
            analytical: true,
            marketing: true,
        });
        setShowBanner(false);
    };

    const handleAcceptSelected = () => {
        savePreferences(tempPrefs);
        setShowManager(false);
        setShowBanner(false);
    };

    const openManager = () => {
        setTempPrefs(preferences || DEFAULT_PREFERENCES);
        setShowManager(true);
    };

    // If already consented or not fully loaded yet, render nothing
    if (!showBanner && !showManager) return null;

    return (
        <>
            {showBanner && !showManager && (
                <div className="pb-safe fixed right-0 bottom-0 left-0 z-50 p-4 sm:p-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-background p-6 shadow-2xl sm:flex-row dark:shadow-black/50">
                            <div className="max-w-3xl flex-1 text-sm text-muted-foreground">
                                <span className="mb-1 block font-semibold text-foreground">
                                    We value your privacy
                                </span>
                                We use cookies and similar technologies to help
                                personalize content, tailor and measure ads, and
                                provide a better experience. By clicking "Accept
                                All", you agree to this use to our{' '}
                                <a
                                    href="/privacy"
                                    className="underline hover:text-foreground"
                                >
                                    Privacy Policy
                                </a>
                                .
                            </div>
                            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
                                <Button
                                    variant="outline"
                                    onClick={openManager}
                                    className="w-full sm:w-auto"
                                >
                                    Manage Preferences
                                </Button>
                                <Button
                                    onClick={handleAcceptAll}
                                    className="w-full sm:w-auto"
                                >
                                    Accept All
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Dialog
                open={showManager}
                onOpenChange={(open) => !open && setShowManager(false)}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cookie Preferences</DialogTitle>
                        <DialogDescription>
                            Customize your cookie preferences. Necessary cookies
                            cannot be disabled as they are required for the
                            website to function.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6">
                        <div className="flex items-start justify-between space-x-2">
                            <div className="flex flex-col gap-1 pr-6">
                                <Label
                                    htmlFor="necessary"
                                    className="text-base font-semibold"
                                >
                                    Strictly Necessary
                                </Label>
                                <span className="text-sm text-muted-foreground">
                                    These cookies are essential for you to
                                    browse the website and use its features.
                                </span>
                            </div>
                            <Switch id="necessary" checked={true} disabled />
                        </div>

                        <div className="flex items-start justify-between space-x-2">
                            <div className="flex flex-col gap-1 pr-6">
                                <Label
                                    htmlFor="analytical"
                                    className="text-base font-semibold"
                                >
                                    Analytical
                                </Label>
                                <span className="text-sm text-muted-foreground">
                                    These cookies help us understand how
                                    visitors interact with the website by
                                    collecting and reporting information
                                    anonymously.
                                </span>
                            </div>
                            <Switch
                                id="analytical"
                                checked={tempPrefs.analytical}
                                onCheckedChange={(checked) =>
                                    setTempPrefs({
                                        ...tempPrefs,
                                        analytical: checked,
                                    })
                                }
                            />
                        </div>

                        <div className="flex items-start justify-between space-x-2">
                            <div className="flex flex-col gap-1 pr-6">
                                <Label
                                    htmlFor="marketing"
                                    className="text-base font-semibold"
                                >
                                    Marketing
                                </Label>
                                <span className="text-sm text-muted-foreground">
                                    These cookies are used to track visitors
                                    across websites to display relevant
                                    advertisements.
                                </span>
                            </div>
                            <Switch
                                id="marketing"
                                checked={tempPrefs.marketing}
                                onCheckedChange={(checked) =>
                                    setTempPrefs({
                                        ...tempPrefs,
                                        marketing: checked,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setShowManager(false)}
                            className="sm:mr-auto"
                        >
                            Cancel
                        </Button>
                        <Button variant="secondary" onClick={handleAcceptAll}>
                            Accept All
                        </Button>
                        <Button onClick={handleAcceptSelected}>
                            Save Preferences
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
