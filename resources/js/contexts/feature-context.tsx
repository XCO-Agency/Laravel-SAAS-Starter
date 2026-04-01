import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { createContext, useContext, type PropsWithChildren } from 'react';

/**
 * Feature configuration type - flattened structure with dot notation keys
 */
type Features = Record<string, boolean>;

interface FeatureContextType {
    features: Features;
    isEnabled: (feature: string) => boolean;
    isDisabled: (feature: string) => boolean;
    anyEnabled: (features: string[]) => boolean;
    allEnabled: (features: string[]) => boolean;
}

const FeatureContext = createContext<FeatureContextType | null>(null);

export function FeatureProvider({ children }: PropsWithChildren) {
    const { features } = usePage<SharedData>().props;

    const isEnabled = (feature: string): boolean => {
        return features?.[feature] ?? true;
    };

    const isDisabled = (feature: string): boolean => {
        return !isEnabled(feature);
    };

    const anyEnabled = (featureList: string[]): boolean => {
        return featureList.some((f) => isEnabled(f));
    };

    const allEnabled = (featureList: string[]): boolean => {
        return featureList.every((f) => isEnabled(f));
    };

    return (
        <FeatureContext.Provider
            value={{
                features: features || {},
                isEnabled,
                isDisabled,
                anyEnabled,
                allEnabled,
            }}
        >
            {children}
        </FeatureContext.Provider>
    );
}

export function useFeatures(): FeatureContextType {
    const context = useContext(FeatureContext);

    if (!context) {
        throw new Error('useFeatures must be used within a FeatureProvider');
    }

    return context;
}

export function useFeature(feature: string): boolean {
    const { isEnabled } = useFeatures();
    return isEnabled(feature);
}
