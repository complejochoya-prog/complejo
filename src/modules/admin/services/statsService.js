import { apiRequest } from "../../../core/api/apiClient";

/**
 * Service to fetch business performance statistics.
 */
export async function getStats() {
    return apiRequest("/stats");
}
