import { apiRequest } from "../../../core/api/apiClient";
import { appendOfflineArray } from "../../../utils/offlineStorage";

/**
 * Service to manage Bar Order API requests.
 */

export async function getOrders() {
    return apiRequest("/orders");
}

export async function createOrder(data) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn("[Orders Service] Device is offline. Queueing order locally.");
        // Add a temporary mock ID for immediate UI updates if needed, though they usually rely on 'pending' status
        const offlineOrder = { ...data, _id: "temp_" + Date.now(), isOffline: true };
        appendOfflineArray("pendingOrders", data); // Queue the RAW data for sync
        return offlineOrder; // Return the mock so UI thinks it succeeded
    }

    return apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export async function updateOrder(id, data) {
    return apiRequest(`/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}
