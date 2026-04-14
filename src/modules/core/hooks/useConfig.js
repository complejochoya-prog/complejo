import { createContext, useContext } from 'react';

export const ConfigContext = createContext({});

/**
 * useConfig Hook
 * Provides business configuration and user state throughout the application.
 */
export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}
