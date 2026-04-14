// smartCenterService.js - IoT & Automation Service
export async function fetchSmartDevices(negocioId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 'light-c1', name: 'Iluminación Cancha 1', type: 'lighting', status: 'off', location: 'Cancha 1', autoMode: true },
                { id: 'light-c2', name: 'Iluminación Cancha 2', type: 'lighting', status: 'on', location: 'Cancha 2', autoMode: true },
                { id: 'gate-main', name: 'Portón Estacionamiento', type: 'access', status: 'closed', location: 'Entrada Secundaría' },
                { id: 'cam-entry', name: 'Cámara Recepción', type: 'camera', status: 'streaming', location: 'Entrada' },
                { id: 'cam-bar', name: 'Cámara Buffet', type: 'camera', status: 'recording', location: 'Bar' },
                { id: 'ac-office', name: 'Aire Acondicionado Oficina', type: 'climate', status: 'off', location: 'Admin' }
            ]);
        }, 500);
    });
}

export async function toggleDevice(negocioId, deviceId, currentStatus) {
    const newStatus = currentStatus === 'on' ? 'off' : 'on';
    console.log(`[IoT] Toggling ${deviceId} to ${newStatus} in ${negocioId}`);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, status: newStatus }), 300));
}

export async function fetchEnergyUsage(negocioId) {
    return {
        dailyUsage: 42.5, // kWh
        peakDemand: 8.2, // kW
        currentLoad: 3.4, // kW
        history: [12, 10, 8, 15, 22, 18, 14] // last 7 days
    };
}

export async function triggerAutomation(negocioId, action) {
    console.log(`[Automation] Triggering ${action} for ${negocioId}`);
    return { success: true };
}
