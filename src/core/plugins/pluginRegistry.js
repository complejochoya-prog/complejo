/**
 * Global Plugin Registry
 * Stores all installed plugins in the system.
 */
const plugins = [];

export function registerPlugin(plugin) {
    plugins.push(plugin);
}

export function getPlugins() {
    return plugins;
}
