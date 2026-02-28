import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { ToastProvider } from './components/ui/toast';
import { initializeTheme } from './hooks/use-appearance';
import i18n from './lib/i18n';
import { configureEcho } from '@laravel/echo-react';

if (import.meta.env.VITE_REVERB_APP_KEY) {
    configureEcho({
        broadcaster: 'reverb',
    });
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN_PUBLIC,
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});

// RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Function to set document direction based on language
const setDocumentDirection = (language: string) => {
    const isRTL = RTL_LANGUAGES.includes(language);
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    // Set direction on both html and body
    const direction = isRTL ? 'rtl' : 'ltr';
    htmlElement.setAttribute('dir', direction);
    htmlElement.setAttribute('lang', language);

    if (bodyElement) {
        bodyElement.setAttribute('dir', direction);
    }

    // Add classes for CSS targeting if needed
    if (isRTL) {
        htmlElement.classList.add('rtl');
        htmlElement.classList.remove('ltr');
        if (bodyElement) {
            bodyElement.classList.add('rtl');
            bodyElement.classList.remove('ltr');
        }
    } else {
        htmlElement.classList.add('ltr');
        htmlElement.classList.remove('rtl');
        if (bodyElement) {
            bodyElement.classList.add('ltr');
            bodyElement.classList.remove('rtl');
        }
    }
};

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Set locale from Inertia shared data if available
        const locale = (props.initialPage.props as { locale?: string })?.locale || 'en';
        if (i18n.language !== locale) {
            i18n.changeLanguage(locale);
        }

        // Set initial document direction
        setDocumentDirection(locale);

        // Listen for language changes
        i18n.on('languageChanged', (lng) => {
            setDocumentDirection(lng);
        });

        root.render(
            <StrictMode>
                <I18nextProvider i18n={i18n}>
                    <ToastProvider>
                        <App {...props} />
                    </ToastProvider>
                </I18nextProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
