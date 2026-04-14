/**
 * menuService.js - Motor de Pedidos y Menú estilo Digital Board
 */

const PROMOS_KEY = 'complejo_promos';
const ORDERS_KEY = 'complejo_pedidos';

export const fetchPromosMenu = () => {
    const data = localStorage.getItem(PROMOS_KEY);
    return data ? JSON.parse(data).filter(p => p.active) : [];
};

export const submitOrder = (orderData) => {
    const currentOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const newOrder = {
        id: Date.now(),
        type: 'promo',
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...orderData
    };
    
    currentOrders.push(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(currentOrders));
    
    // Disparar evento para pantallas de cocina/bar
    window.dispatchEvent(new CustomEvent('new_order', { detail: newOrder }));
    
    return { success: true, orderId: newOrder.id };
};
