/**
 * Provider Builder (Moved to src/core/router)
 * Connects all context providers from active modules.
 */
import React from "react";
import { getModules } from "../modules/moduleRegistry";
import { getPlugins } from "../plugins/pluginRegistry";

/**
 * Wraps children with all active module and plugin providers.
 * @param {React.ReactNode} children - Contents to wrap
 * @param {string[]} activeModuleIds - IDs of active modules (empty = all)
 * @param {React.Component[]} excludeProviders - Providers already mounted higher in the tree
 * @returns {React.ReactNode}
 */
export function buildProviders(children, activeModuleIds = [], excludeProviders = []) {
    const modules = getModules();
    const plugins = getPlugins();

    // SaaS Filter
    const activeModules = activeModuleIds.length === 0
        ? modules
        : modules.filter(mod =>
            mod.id === 'core' || activeModuleIds.includes(mod.id)
        );

    let allProviders = [];
    
    // Add module providers
    activeModules.forEach(module => {
        if (module.providers) {
            allProviders = allProviders.concat(module.providers);
        }
    });

    // Add plugin providers
    plugins.forEach(plugin => {
        if (plugin.providers) {
            allProviders = allProviders.concat(plugin.providers);
        }
    });

    const filteredProviders = allProviders.filter(P => !excludeProviders.includes(P));

    return filteredProviders.reduceRight((acc, Provider) => {
        return <Provider>{acc}</Provider>;
    }, children);
}
