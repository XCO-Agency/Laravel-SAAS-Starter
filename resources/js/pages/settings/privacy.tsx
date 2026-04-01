import { useCookieConsent } from '@/components/cookie-consent-banner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import ProfileLayout from '@/layouts/settings/profile-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function PrivacySettings() {
    const { preferences, isLoaded, savePreferences } = useCookieConsent();
    const { addToast } = useToast();

    // Local state for the toggles before saving
    const [tempPrefs, setTempPrefs] = useState({
        necessary: true,
        analytical: false,
        marketing: false,
    });

    useEffect(() => {
        if (isLoaded && preferences) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTempPrefs(preferences);
        }
    }, [isLoaded, preferences]);

    const handleSave = () => {
        savePreferences(tempPrefs);
        addToast('Privacy preferences updated successfully.', 'success');
    };

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Cookies', href: '/settings/privacy' }]}
        >
            <Head title="Cookies" />
            <ProfileLayout
                title="Cookies"
                description="Manage your cookie preferences and consent settings."
            >
                <div className="space-y-6">
                    <div className="mt-4 max-w-2xl space-y-6">
                        <div className="flex items-start justify-between space-x-2 rounded-lg border p-4 shadow-sm">
                            <div className="flex flex-col gap-1 pr-6">
                                <Label
                                    htmlFor="necessary"
                                    className="text-base font-semibold"
                                >
                                    Strictly Necessary
                                </Label>
                                <span className="text-sm text-muted-foreground">
                                    These cookies are essential for the website
                                    to function properly and cannot be disabled.
                                </span>
                            </div>
                            <Switch id="necessary" checked={true} disabled />
                        </div>

                        <div className="flex items-start justify-between space-x-2 rounded-lg border p-4 shadow-sm">
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

                        <div className="flex items-start justify-between space-x-2 rounded-lg border p-4 shadow-sm">
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

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSave}>
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                </div>
            </ProfileLayout>
        </AppLayout>
    );
}
