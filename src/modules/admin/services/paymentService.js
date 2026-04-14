/**
 * PaymentService - FASE 11
 * Mock integration with MercadoPago API.
 */

// Simulated endpoint for generating MercadoPago preferences
export async function createPaymentPreference(negocioId, paymentData) {
    try {
        console.log(`[PaymentService] Generando link MP para ${negocioId}`, paymentData);
        // Simulamos la respuesta de la API de MercadoPago
        // En un entorno real, esto haría un POST a un endpoint de tu backend (ej: /api/mp/create_preference)
        // El cual a su vez usaría mercadopago-sdk para devolver el init_point
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: `pref_${Math.random().toString(36).substr(2, 9)}`,
                    init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock_${negocioId}`,
                    sandbox_init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock_${negocioId}`,
                });
            }, 800);
        });
    } catch (error) {
        console.error("Error creating payment preference:", error);
        throw error;
    }
}

// Simulated endpoint to fetch payment history for Admin Dashboard
export async function fetchPagosAdmin(negocioId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: '1', cliente: 'Juan Perez', concepto: 'Reserva Cancha 1 - 20:00', monto: 8000, estado: 'pagado', fecha: '2026-03-13T10:05:00Z', tipo: 'reserva' },
                { id: '2', cliente: 'Mario Gomez', concepto: 'Inscripción Torneo Padel', monto: 15000, estado: 'pendiente', fecha: '2026-03-13T11:20:00Z', tipo: 'torneo' },
                { id: '3', cliente: 'Mesa 4', concepto: 'Pedido Bar #014', monto: 12500, estado: 'pagado', fecha: '2026-03-13T11:45:00Z', tipo: 'bar' },
                { id: '4', cliente: 'G. Almada', concepto: 'Reserva Cancha 3 - 18:00', monto: 8000, estado: 'cancelado', fecha: '2026-03-12T19:00:00Z', tipo: 'reserva' }
            ]);
        }, 500);
    });
}
