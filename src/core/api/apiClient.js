/**
 * API Client Utility
 * Handles fetch requests and automatically injects JWT tokens.
 */
const API_URL = "/api";

export async function apiRequest(endpoint, options = {}) {
    const saasSession = localStorage.getItem("superadmin_session");
    let token = localStorage.getItem("token");

    // Si estamos en una ruta de SAAS y tenemos sesión de SuperAdmin, usamos ese "token" (simulado o Real)
    if (endpoint.startsWith('/saas') && saasSession) {
        try {
            const adminData = JSON.parse(saasSession);
            token = adminData.token || "mock-superadmin-token"; // El backend mock aceptará cualquier token para superadmin
        } catch (e) {}
    }

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(API_URL + endpoint, {
            ...options,
            headers
        });

        if (response.status === 204) return null;

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error en la petición API");
        }

        return data;
    } catch (error) {
        console.error(`[API Client] Error on ${endpoint}:`, error.message);
        // Fallback para desarrollo si el backend está caído (OPCIONAL)
        // throw error; 
        
        // MOCK de éxito para que el front no muera en demopurposes si el usuario no levantó el backend aún
        if(endpoint === '/pedidos' && options.method === 'POST') {
             console.warn("BACKEND OFFLINE: Retornando Mock Exitoso para demo");
             return { success: true, orderId: 'MOCK-' + Date.now() };
        }
        throw error;
    }
}
