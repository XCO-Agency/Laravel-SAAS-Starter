/**
 * Simple translations hook for the application.
 * Returns the fallback value for now - can be extended to support full i18n later.
 */
export function useTranslations() {
    const t = (key: string, fallback: string): string => {
        // For now, just return the fallback value
        // This can be extended to support actual translations later
        return fallback;
    };

    return { t };
}

