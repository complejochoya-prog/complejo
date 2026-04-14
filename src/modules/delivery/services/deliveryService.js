const ORDERS_KEY = 'giovanni_orders';
const EMPLEADOS_KEY = 'complejo_empleados';

export const deliveryService = {
    // Get all orders from localStorage
    getOrders: () => {
        return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    },

    // Update order status and details
    updateOrder: (orderId, updates) => {
        const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
        const index = orders.findIndex(o => o.id === orderId);
        
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates };
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            // Trigger storage event for other tabs
            window.dispatchEvent(new Event('storage'));
            return { success: true, order: orders[index] };
        }
        return { success: false, message: 'Pedido no encontrado' };
    },

    // Get current rider session from localStorage
    getCurrentRider: () => {
        const id = localStorage.getItem('delivery_userId');
        const name = localStorage.getItem('delivery_userName');
        const role = localStorage.getItem('delivery_userRole');
        
        if (!id) return null;
        return { id, name, role };
    },

    // Get delivery specific orders
    getDeliveryOrders: () => {
        const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
        return orders.filter(o => o.tipo === 'Delivery');
    }
};
