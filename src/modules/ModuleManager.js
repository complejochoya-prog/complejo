import { SystemModules } from './index';

/**
 * ModuleManager handles the filtering and activation of modules
 * based on the business configuration (SaaS plan).
 */
export const ModuleManager = {
    /**
     * Returns all modules that should be active for the current business.
     * In a real SaaS, this would check `businessData.activeModules` or `plan`.
     */
    getActiveModules: (activeModuleIds = []) => {
        // 'core' is always active
        const alwaysActive = ['core'];

        // If no activeModuleIds are provided (e.g., loading), we might return only core or all for dev.
        // For this phase, if activeModuleIds is empty, we'll return all modules to avoid breaking things,
        // but normally we'd filter.
        if (activeModuleIds.length === 0) {
            return SystemModules;
        }

        return SystemModules.filter(mod =>
            alwaysActive.includes(mod.id) || activeModuleIds.includes(mod.id)
        );
    },

    /**
     * Extracts all routes from active modules
     */
    getRoutes: (activeModules) => {
        return activeModules.flatMap(mod => mod.routes || []);
    },

    /**
     * Extracts all providers from active modules
     */
    getProviders: (activeModules) => {
        return activeModules.flatMap(mod => mod.providers || []);
    }
};
