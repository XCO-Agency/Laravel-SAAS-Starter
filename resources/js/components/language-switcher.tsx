import { update as updateLocale } from '@/routes/profile/locale';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/use-translations';
import { router } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LanguageSwitcherProps {
    currentLocale?: string;
}

const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'ar', label: 'العربية' },
];

export function LanguageSwitcher({ currentLocale = 'en' }: LanguageSwitcherProps) {
    const { t, i18n } = useTranslations();
    const [localeValue, setLocaleValue] = useState(currentLocale);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentLocale && i18n.language !== currentLocale) {
            i18n.changeLanguage(currentLocale);
            setLocaleValue(currentLocale);
        }
    }, [currentLocale, i18n]);

    const handleLocaleChange = (newLocale: string) => {
        if (newLocale === localeValue || loading) {
            return;
        }

        setLoading(true);
        i18n.changeLanguage(newLocale);

        router.patch(
            updateLocale.url(),
            { locale: newLocale },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setLocaleValue(newLocale);
                    setLoading(false);
                },
                onError: () => {
                    // Revert on error
                    i18n.changeLanguage(localeValue);
                    setLoading(false);
                },
            },
        );
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <label htmlFor="locale" className="text-sm font-medium">
                    {t('settings.language.title', 'Language')}
                </label>
            </div>
            <Select value={localeValue} onValueChange={handleLocaleChange} disabled={loading}>
                <SelectTrigger id="locale" className="w-full">
                    <SelectValue placeholder={t('settings.language.description', 'Select your preferred language')} />
                </SelectTrigger>
                <SelectContent>
                    {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                            {lang.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
                {t('settings.language.description', 'Select your preferred language')}
            </p>
        </div>
    );
}

