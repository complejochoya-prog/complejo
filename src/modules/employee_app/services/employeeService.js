export async function fetchEmployeeReservations(negocioId, date) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 'res_101', cliente: 'Juan Perez', cancha: 'Cancha 1 (Fútbol 5)', hora: '19:00', estado: 'pendiente', pago_estado: 'pendiente', precio: 8000 },
                { id: 'res_102', cliente: 'Martin Gomez', cancha: 'Padel Pro 1', hora: '19:30', estado: 'jugando', pago_estado: 'pagado', precio: 10000 },
                { id: 'res_103', cliente: 'Equipo Zeta', cancha: 'Cancha 2 (Fútbol 7)', hora: '20:00', estado: 'pendiente', pago_estado: 'pagado', precio: 12000 },
            ]);
        }, 500);
    });
}

export async function fetchEmployeeOrders(negocioId, filterBy = 'todas') {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allOrders = [
                { id: 'ord_201', mesa: 'Cancha 1', items: [{ nombre: 'Agua x2', qty: 2 }, { nombre: 'Gatorade', qty: 1 }], estado: 'preparando', tipo: 'bar' },
                { id: 'ord_202', mesa: 'Mesa 4', items: [{ nombre: 'Pizza Mozzarella', qty: 1 }, { nombre: 'Cerveza IPA', qty: 2 }], estado: 'pendiente', tipo: 'cocina' },
                { id: 'ord_203', mesa: 'Padel 1', items: [{ nombre: 'Hamburguesa', qty: 2 }], estado: 'listo', tipo: 'cocina' },
            ];
            
            if (filterBy === 'cocina') {
                resolve(allOrders.filter(o => o.tipo === 'cocina' || o.items.some(i => i.nombre.includes('Pizza') || i.nombre.includes('Hamburguesa'))));
            } else if (filterBy === 'bar') {
                resolve(allOrders); // Bar sees everything usually to dispatch drinks
            } else {
                resolve(allOrders);
            }
        }, 600);
    });
}

export async function updateOrderStatus(negocioId, orderId, newStatus) {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true, newStatus }), 300);
    });
}

export async function updateReservationStatus(negocioId, reservaId, field, value) {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true, field, value }), 300);
    });
}
