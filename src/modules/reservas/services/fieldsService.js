import { apiRequest } from "../../../core/api/apiClient";

/**
 * Service to manage court (field) API requests.
 */

export async function getFields() {
    return apiRequest("/fields");
}

export async function createField(data) {
    return apiRequest("/fields", {
        method: "POST",
        body: JSON.stringify(data)
    });
}
