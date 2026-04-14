function getAll(negocioId) {
    if (!negocioId) return [];
    try {
        const key = `${negocioId}_orders`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

function saveAll(negocioId, list) {
    if (!negocioId) return;
    const key = `${negocioId}_orders`;
    localStorage.setItem(key, JSON.stringify(list));
    // Notificar a otras pestañas
    window.dispatchEvent(new Event('storage'));
}

export async function createOrder(negocioId, orderData) {
    const list = getAll(negocioId);
    const newOrder = {
        id: orderData.id,
        mesa: orderData.mesa || orderData.type,
        cliente: orderData.cliente || 'Cliente',
        telefono: orderData.telefono || '',
        direccion: orderData.direccion || '',
        ubicacionLink: orderData.ubicacionLink || '',
        estado: 'nuevo',
        tipo: orderData.tipo || orderData.type,
        productos: orderData.items.map(item => ({
            nombre: item.nombre,
            codigo: item.codigo || item.id,
            quantity: item.cantidad || item.quantity || 1,
            precio: item.precio,
            observaciones: item.observaciones || ''
        })),
        hora: orderData.hora || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        total: orderData.total,
        createdAt: new Date().toISOString()
    };
    list.unshift(newOrder);
    saveAll(negocioId, list);
    
    return { success: true, order: newOrder };
}

export async function fetchKitchenOrders(negocioId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const list = getAll(negocioId);
            // Retornar solo los que NO están entregados
            resolve(list.filter(o => o.estado !== 'entregado'));
        }, 100);
    });
}

export async function updateOrderStatus(negocioId, orderId, nextStatus) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const list = getAll(negocioId);
            const updatedList = list.map(o => {
                if (o.id === orderId) {
                    const updated = { ...o, estado: nextStatus };
                    if (nextStatus === 'preparando') updated.startedAt = new Date().toISOString();
                    if (nextStatus === 'listo') updated.readyAt = new Date().toISOString();
                    if (nextStatus === 'entregado') updated.deliveredAt = new Date().toISOString();
                    return updated;
                }
                return o;
            });
            saveAll(negocioId, updatedList);
            resolve({ success: true });
        }, 300);
    });
}

export async function fetchOrderHistory(negocioId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const list = getAll(negocioId);
            resolve(list.filter(o => o.estado === 'entregado'));
        }, 300);
    });
}
