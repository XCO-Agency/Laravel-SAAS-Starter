import { useTranslation } from 'react-i18next';

/**
 * Translations hook for the application using react-i18next.
 */
export function useTranslations() {
    const { t, i18n } = useTranslation();

    return { t, i18n };
}

