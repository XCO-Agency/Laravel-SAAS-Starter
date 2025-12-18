import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * RTL languages that require right-to-left direction
 */
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * Hook to manage RTL (Right-to-Left) direction for Arabic and other RTL languages
 */
export function useRTL() {
    const { i18n } = useTranslation();

    useEffect(() => {
        const isRTL = RTL_LANGUAGES.includes(i18n.language);
        const htmlElement = document.documentElement;

        // Set dir attribute
        htmlElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

        // Set lang attribute
        htmlElement.setAttribute('lang', i18n.language);

        // Add/remove RTL class for CSS targeting
        if (isRTL) {
            htmlElement.classList.add('rtl');
            htmlElement.classList.remove('ltr');
        } else {
            htmlElement.classList.add('ltr');
            htmlElement.classList.remove('rtl');
        }

        // Cleanup function
        return () => {
            // Reset to default on unmount if needed
        };
    }, [i18n.language]);
}






