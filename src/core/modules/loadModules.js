/**
 * Module Loader — Loads modules dynamically based on active config.
 * Filters by activeModules list from ConfigContext.
 */
import { getModules } from './moduleRegistry';

/**
 * Returns only modules that are in the activeModules list.
 * 'core' and 'admin' are always loaded.
 */
export function loadModules(activeModuleIds = []) {
    const allModules = getModules();

    if (!activeModuleIds || activeModuleIds.length === 0) {
        return allModules; // Load all if no filter specified
    }

    return allModules.filter(mod =>
        mod.id === 'core' || mod.id === 'admin' || activeModuleIds.includes(mod.id)
    );
}
