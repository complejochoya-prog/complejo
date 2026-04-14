import { apiRequest } from "../../../core/api/apiClient";

/**
 * Service to manage Bar Product API requests.
 */

export async function getProducts() {
    return apiRequest("/products");
}

export async function createProduct(data) {
    return apiRequest("/products", {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export async function updateProduct(id, data) {
    return apiRequest(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}
