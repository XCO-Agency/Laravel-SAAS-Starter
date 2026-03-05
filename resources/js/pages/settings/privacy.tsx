import { useCookieConsent } from '@/components/cookie-consent-banner';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
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
            setTempPrefs(preferences);
        }
    }, [isLoaded, preferences]);

    const handleSave = () => {
        savePreferences(tempPrefs);
        addToast('Privacy preferences updated successfully.', 'success');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Privacy & Cookies', href: '/settings/privacy' }]}>
            <Head title="Privacy & Cookies" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Cookie Preferences"
                        description="Manage how your data is tracked across our application."
                    />

                    <div className="space-y-6 max-w-2xl mt-4">
                        <div className="flex items-start justify-between space-x-2 rounded-lg border p-4 shadow-sm">
                            <div className="flex flex-col gap-1 pr-6">
                                <Label htmlFor="necessary" className="font-semibold text-base">Strictly Necessary</Label>
                                <span className="text-sm text-muted-foreground">These cookies are essential for the website to function properly and cannot be disabled.</span>
                            </div>
                            <Switch id="necessary" checked={true} disabled />
                        </div>

                        <div className="flex items-start justify-between space-x-2 rounded-lg border p-4 shadow-sm">
                            <div className="flex flex-col gap-1 pr-6">
                                <Label htmlFor="analytical" className="font-semibold text-base">Analytical</Label>
                                <span className="text-sm text-muted-foreground">These cookies help us understand how visitors interact with the website by collecting and reporting information anonymously.</span>
                            </div>
                            <Switch
                                id="analytical"
                                checked={tempPrefs.analytical}
                                onCheckedChange={(checked) => setTempPrefs({ ...tempPrefs, analytical: checked })}
                            />
                        </div>

                        <div className="flex items-start justify-between space-x-2 rounded-lg border p-4 shadow-sm">
                            <div className="flex flex-col gap-1 pr-6">
                                <Label htmlFor="marketing" className="font-semibold text-base">Marketing</Label>
                                <span className="text-sm text-muted-foreground">These cookies are used to track visitors across websites to display relevant advertisements.</span>
                            </div>
                            <Switch
                                id="marketing"
                                checked={tempPrefs.marketing}
                                onCheckedChange={(checked) => setTempPrefs({ ...tempPrefs, marketing: checked })}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSave}>
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
