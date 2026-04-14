import { apiRequest } from "../../../core/api/apiClient";

/**
 * Service to handle payment-related API requests.
 */

/**
 * Requests a MercadoPago payment link (preference) for a reservation.
 * @param {Object} data - Booking details (cancha, fecha, hora, etc.)
 */
export async function pagarReserva(data) {
    return apiRequest("/reservas/pago", {
        method: "POST",
        body: JSON.stringify(data)
    });
}
