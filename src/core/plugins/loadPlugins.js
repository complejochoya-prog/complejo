/**
 * Automatic Plugin Loader
 * Imports and registers all installed plugins from src/plugins/.
 */
import { registerPlugin } from "./pluginRegistry";
import { pluginStore } from "../marketplace/pluginStore";
import { loadInstalledPlugins } from "../marketplace/pluginInstaller";
import { AnalyticsPlugin } from "../../plugins/analytics";
import { ReservasModule } from "../../modules/reservas";
import { MarketingPlugin } from "../../plugins/marketing";

export function loadPlugins() {
    // Load persisted installation status
    loadInstalledPlugins();

    const availablePlugins = {
        analytics: AnalyticsPlugin,
        reservas: ReservasModule,
        marketing: MarketingPlugin
    };

    // Only register plugins that are marked as 'installed' in our store
    pluginStore.forEach(p => {
        if (p.installed && availablePlugins[p.id]) {
            registerPlugin(availablePlugins[p.id]);
        }
    });
}
