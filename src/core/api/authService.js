import { apiRequest } from "./apiClient";

/**
 * Auth Service
 * Manages login, logout, and session storage.
 */

/**
 * Performs a login request and stores the returned session data.
 */
export async function login(email, password) {
    try {
        const data = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", data.user.role);
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("userName", data.user.name);
            localStorage.setItem("negocioId", data.user.negocioId);
        }

        return data;
    } catch (error) {
        console.error("[Auth Service] Login failed:", error.message);
        throw error;
    }
}

/**
 * Clears current session data.
 */
export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("negocioId");
    window.location.reload();
}

/**
 * Checks if the user is currently authenticated.
 */
export function isAuthenticated() {
    return !!localStorage.getItem("token");
}
