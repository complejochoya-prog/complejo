export async function validateAccessCode(negocioId, code) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock logic: codes starting with 'INVALID' fail
            if (code.startsWith('INVALID')) {
                resolve({ 
                    success: false, 
                    error: 'Reserva no encontrada o código expirado' 
                });
            } else {
                resolve({
                    success: true,
                    data: {
                        reservaId: code,
                        cliente: 'Socio VIP #23',
                        cancha: 'Cancha 1 (Fútbol 5)',
                        horario: '18:00 - 19:00',
                        estado_pago: 'pagado',
                        timestamp: new Date().toISOString()
                    }
                });
            }
        }, 800);
    });
}

export async function fetchAccessLogs(negocioId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 'l1', cliente: 'Juan Perez', cancha: 'Cancha 2', tipo: 'ingreso', hora: '2026-03-13T18:02:00Z' },
                { id: 'l2', cliente: 'Martin Gomez', cancha: 'Padel 1', tipo: 'ingreso', hora: '2026-03-13T19:05:00Z' },
                { id: 'l3', cliente: 'Juan Perez', cancha: 'Cancha 2', tipo: 'egreso', hora: '2026-03-13T19:02:00Z' },
            ]);
        }, 500);
    });
}

export async function toggleSmartLock(negocioId, resourceId, action) {
    // Simulated IoT command for locks or turnstiles
    console.log(`[IoT] ${action} command sent to ${resourceId} in ${negocioId}`);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300));
}
