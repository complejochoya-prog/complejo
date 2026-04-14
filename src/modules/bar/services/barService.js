import { fetchProductos } from '../../inventario/services/inventarioService';
import { apiRequest } from '../../../core/api/apiClient';
import { emit } from '../../../core/events/eventBus';

/**
 * barService.js - Lógica operativa del bar y mesas
 */

export async function fetchBarMenu(negocioId) {
    const list = await fetchProductos(negocioId, { sector: 'BAR' });
    return list.map(item => ({
        id: item.id,
        nombre: item.nombre,
        descripcion: item.descripcion || `${item.categoria} // Stock: ${item.stock}`,
        precio: item.precio,
        categoria: item.categoria,
        stock: item.stock,
        img: item.img || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=400'
    }));
}

export const getStatusConfig = (status) => {
    const configs = {
        'disponible': { color: 'emerald', label: 'Libre', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500' },
        'ocupada': { color: 'amber', label: 'Ocupada', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500' },
        'cuenta solicitada': { color: 'rose', label: 'Cuenta', bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500' },
        'pagada': { color: 'slate', label: 'Pagada', bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400' }
    };
    return configs[status] || configs['disponible'];
};

/**
 * SUBMIT ORDER (REST API)
 * Envía el pedido al backend para validación real, descuento de stock y caja.
 */
export async function submitOrder(negocioId, orderData) {
    try {
        // Guardar copia local para sincronización inmediata con la cocina
        const localKey = `${negocioId}_orders`;
        const currentOrders = JSON.parse(localStorage.getItem(localKey)) || [];
        const newOrder = { 
            id: `L-${Date.now()}`,
            ...orderData,
            status: orderData.status || 'nuevo',
            estado: orderData.estado || 'nuevo',
            timestamp: new Date().toISOString() 
        };
        localStorage.setItem(localKey, JSON.stringify([newOrder, ...currentOrders]));
        
        // Disparar storage event manualmente (no se dispara en la misma ventana nativamente)
        const storageEvent = new Event('storage');
        storageEvent.key = localKey;
        window.dispatchEvent(storageEvent);

        // 🔥 Emitir evento para que PedidosContext lo reciba en la misma SPA
        emit('pedido_creado', newOrder);

        // Intentar envío al backend
        const response = await apiRequest('/pedidos', {
            method: 'POST',
            headers: { 'X-Negocio-ID': negocioId },
            body: JSON.stringify(newOrder)
        });

        return { success: true, orderId: response.orderId || newOrder.id };
    } catch (error) {
        console.warn('[BarService] Backend offline, pedido guardado localmente');
        return { success: true, local: true, orderId: `L-${Date.now()}` };
    }
}

export async function processPayment(negocioId, paymentData) {
    // Para simplificar esta fase, re-utilizamos el endpoint de pedidos o creamos uno de pagos
    // Por ahora, el backend de pedidos ya maneja el registro en caja si el status es 'paid'
    try {
        return await apiRequest('/pedidos', {
            method: 'POST',
            headers: { 'X-Negocio-ID': negocioId },
            body: JSON.stringify({
                ...paymentData,
                status: 'paid'
            })
        });
    } catch (error) {
        console.error("Error processing payment:", error);
        throw error;
    }
}
