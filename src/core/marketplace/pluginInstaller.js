import { pluginStore } from "./pluginStore";
import { LocalDB } from "../database/localDB";

const STORAGE_KEY = "installed_plugins";

/**
 * Loads the list of installed plugins from LocalDB and updates the store.
 */
export function loadInstalledPlugins() {
    const saved = LocalDB.get(STORAGE_KEY);
    if (!saved) return;
    
    pluginStore.forEach(plugin => {
        plugin.installed = saved.includes(plugin.id);
    });
}

/**
 * Saves current installed status to LocalDB.
 */
function savePlugins() {
    const installed = pluginStore
        .filter(p => p.installed)
        .map(p => p.id);
    LocalDB.save(STORAGE_KEY, installed);
}

/**
 * Marks a plugin as installed.
 * @param {string} pluginId 
 */
export function installPlugin(pluginId) {
    const plugin = pluginStore.find(p => p.id === pluginId);
    if (!plugin) return;
    plugin.installed = true;
    savePlugins();
    console.log(`[Marketplace] Plugin installed and saved: ${pluginId}`);
}

/**
 * Marks a plugin as uninstalled.
 * @param {string} pluginId 
 */
export function uninstallPlugin(pluginId) {
    const plugin = pluginStore.find(p => p.id === pluginId);
    if (!plugin) return;
    plugin.installed = false;
    savePlugins();
    console.log(`[Marketplace] Plugin uninstalled and saved: ${pluginId}`);
}
