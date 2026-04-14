import { useState, useEffect, useCallback } from 'react';
import { fetchKitchenOrders, updateOrderStatus } from '../services/kitchenService';
import { useParams } from 'react-router-dom';

export default function useKitchenOrders() {
    const { negocioId } = useParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = useCallback(async () => {
        try {
            const data = await fetchKitchenOrders(negocioId);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching kitchen orders', error);
        } finally {
            setLoading(false);
        }
    }, [negocioId]);

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 2000);
        return () => clearInterval(interval);
    }, [loadOrders]);

    const changeStatus = async (orderId, nextStatus) => {
        try {
            const res = await updateOrderStatus(negocioId, orderId, nextStatus);
            if (res.success) {
                // Optimistic UI update or wait for next poll
                loadOrders();
            }
        } catch (error) {
            console.error('Error updating order status', error);
        }
    };

    return {
        orders,
        loading,
        changeStatus,
        refresh: loadOrders
    };
}
