import { apiRequest } from "../../../core/api/apiClient";

/**
 * Service to handle court reservation API requests.
 */

/**
 * Fetches all reservations for the current business.
 */
export async function getReservas() {
    return apiRequest("/reservas");
}

/**
 * Creates a new reservation.
 * @param {Object} data - Reservation data (cancha, cliente, fecha, hora, etc.)
 */
export async function crearReserva(data) {
    return apiRequest("/reservas", {
        method: "POST",
        body: JSON.stringify(data)
    });
}
