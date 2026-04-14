import { getOffline, removeOffline } from "./offlineStorage";
import { createOrder } from "../modules/bar/services/ordersService";

/**
 * Service responsible for synchronizing offline data with the backend
 * once internet connectivity is restored.
 */

export async function syncOrders() {
    try {
        const pendingOrders = getOffline("pendingOrders");

        if (!pendingOrders || !Array.isArray(pendingOrders) || pendingOrders.length === 0) {
            return; // Nothing to sync
        }

        console.log(`[Sync Service] Internet restored. Synchronizing ${pendingOrders.length} pending orders...`);

        // Iterate and submit each order. Note: If many orders, Promise.all might be better, 
        // but sequential iteration ensures order and makes error handling easier for individual failures.
        const failedOrders = [];

        for (const order of pendingOrders) {
            try {
                // Submit to backend
                await createOrder(order);
                console.log(`[Sync Service] Successfully synced order for ${order.mesa}`);
            } catch (error) {
                console.error(`[Sync Service] Failed to sync order for ${order.mesa}:`, error);
                // Retain failed orders to retry later
                failedOrders.push(order);
            }
        }

        // Update local storage. If all succeeded, remove the key. 
        // If some failed, overwrite with the remaining failed ones.
        if (failedOrders.length === 0) {
            removeOffline("pendingOrders");
            console.log("[Sync Service] All pending orders synced successfully.");
        } else {
            console.warn(`[Sync Service] ${failedOrders.length} orders failed to sync. Will retry later.`);
            // Using absolute import from offlineStorage.js would be circular if not careful, 
            // but we imported it normally.
            localStorage.setItem("pendingOrders", JSON.stringify(failedOrders));
        }

    } catch (error) {
        console.error("[Sync Service] Critical error during synchronization:", error);
    }
}

/**
 * Initializes global event listeners to trigger synchronization automatically.
 * Should be called once during app initialization.
 */
export function initSyncService() {
    if (typeof window !== 'undefined') {
        window.addEventListener("online", () => {
            console.log("[Sync Service] Detected online status. Triggering sync process.");
            syncOrders();
        });
    }
}
