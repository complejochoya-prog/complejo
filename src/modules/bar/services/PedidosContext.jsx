import { db } from '../../../firebase/config';
import {
    collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc, deleteDoc, addDoc, getDoc, getDocs, limit, serverTimestamp, where
} from 'firebase/firestore';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { apiRequest } from '../../../core/api/apiClient';
import { emit, on, off } from '../../../core/events/eventBus';

/**
 * PEDIDOS CONTEXT v4.0 (HIGH-INTENSITY PRODUCTION)
 * Optimización de renders, control de desuscripción y notificaciones agrupadas.
 */
const PedidosContext = createContext({});

export function usePedidos() {
    return useContext(PedidosContext);
}

export default function PedidosProvider({ children }) {
    const { negocioId } = useConfig();
    const [orders, setOrders] = useState([]);
    const [barProducts, setBarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 🔥 CARGA INICIAL DESDE LOCALSTORAGE (Global Fix)
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem("giovanni_orders")) || [];

            setOrders((prev) => {
                // 🔥 merge sin pisar los nuevos
                const map = new Map();

                [...stored, ...prev].forEach(order => {
                    map.set(order.id, order);
                });

                return Array.from(map.values());
            });

        } catch (e) {
            console.warn("Error cargando pedidos iniciales", e);
        }
    }, []);
    
    // NOTIFICATION DEBOUNCE
    const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
    const lastSoundTime = useRef(0);
    const orderCountRef = useRef(0);

    const playNotification = useCallback(() => {
        const now = Date.now();
        if (now - lastSoundTime.current > 3000) { // Max 1 sound each 3s
            notificationSound.current.play().catch(() => {});
            lastSoundTime.current = now;
        }
    }, []);

    // ⚡ REALTIME SYNC (SECURE & CLEAN)
    useEffect(() => {
        if (!negocioId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // 1. Carga de LocalStorage
        const loadLocalOnly = () => {
             const localKey = `${negocioId}_orders`;
             try {
                 const data = JSON.parse(localStorage.getItem(localKey)) || [];
                 const formattedLocal = data.map(o => ({
                     ...o, 
                     timestamp: new Date(o.timestamp || o.id),
                     status: o.status || o.estado || 'nuevo',
                     estado: o.estado || o.status || 'nuevo'
                 }));
                 
                 setOrders(prev => {
                     const orderMap = new Map();
                     prev.forEach(o => orderMap.set(o.id, o));
                     formattedLocal.forEach(local => {
                         if (orderMap.has(local.id)) {
                             const existing = orderMap.get(local.id);
                             existing.status = local.status || existing.status;
                             existing.estado = local.estado || existing.estado;
                             orderMap.set(local.id, existing);
                         } else {
                             orderMap.set(local.id, local);
                         }
                     });
                     return Array.from(orderMap.values()).sort((a,b) => b.timestamp - a.timestamp);
                 });
             } catch(e) {
                 console.warn('Error loading local orders:', e);
             }
             setLoading(false);
        };

        // 2. FIRESTORE REALTIME
        const qOrders = query(
            collection(db, 'negocios', negocioId, 'pedidos'), 
            orderBy('timestamp', 'desc'), 
            limit(50) 
        );
        
        const unsubOrders = onSnapshot(qOrders, (snap) => {
            const listFromFirestore = snap.docs.map(d => ({ 
                id: d.id, 
                ...d.data(),
                timestamp: d.data().timestamp?.toDate() || new Date(d.data().timestamp || Date.now())
            }));
            
            setOrders(prev => {
                const combined = [...listFromFirestore];
                const localKey = `${negocioId}_orders`;
                const localData = JSON.parse(localStorage.getItem(localKey)) || [];

                localData.forEach(local => {
                    if (!combined.some(o => o.id === local.id)) {
                        combined.push({
                             ...local,
                             timestamp: new Date(local.timestamp || local.id)
                        });
                    }
                });
                
                return combined.sort((a,b) => b.timestamp - a.timestamp);
            });
            setLoading(false);
        }, (err) => {
            console.warn("Order Subscription fallback triggered by error:", err);
            loadLocalOnly();
        });

        // Carga inicial desde localStorage
        loadLocalOnly();

        // 3. Bar Products
        const unsubProducts = onSnapshot(collection(db, 'negocios', negocioId, 'inventario'), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.sector === 'BAR');
            setBarProducts(list);
        });

        // 4. STORAGE LISTENER
        const handleStorage = (e) => {
             if (e.key === `${negocioId}_orders`) {
                 loadLocalOnly();
             }
        };
        window.addEventListener('storage', handleStorage);

        // CLEANUP
        return () => {
             unsubOrders();
             unsubProducts();
             window.removeEventListener('storage', handleStorage);
        };
    }, [negocioId, playNotification]);

    // 🔥 ESCUCHA GLOBAL DE PEDIDOS (FIX PRINCIPAL)
    useEffect(() => {
        const handler = (pedido) => {
            console.log('[PedidosContext] Pedido recibido:', pedido);

            if (!pedido) return;

            setOrders((prev) => {
                const exists = prev.some(o => o.id === pedido.id);
                if (exists) return prev;

                return [pedido, ...prev];
            });

            // persistencia segura
            try {
                const stored = JSON.parse(localStorage.getItem("giovanni_orders")) || [];

                const exists = stored.some(o => o.id === pedido.id);
                if (!exists) {
                    stored.unshift(pedido);
                    localStorage.setItem("giovanni_orders", JSON.stringify(stored));
                }

            } catch (e) {
                console.warn("Error guardando pedidos", e);
            }
        };

        on('pedido_creado', handler);
        
        return () => off('pedido_creado', handler);
    }, []);

    // OPTIMIZED ACTIONS (useCallback to prevent re-renders in children)
    const addOrder = useCallback(async (orderData) => {
        try {
            // Guardar en LOCAL STORAGE primero o como fallback para que la cocina lo vea al instante
            const localKey = `${negocioId}_orders`;
            const prevOrders = JSON.parse(localStorage.getItem(localKey)) || [];
            const newOrder = { 
                ...orderData, 
                id: orderData.id || `L-${Date.now()}`,
                timestamp: orderData.timestamp || new Date().toISOString()
            };
            
            if (!prevOrders.some(o => o.id === newOrder.id)) {
                localStorage.setItem(localKey, JSON.stringify([newOrder, ...prevOrders]));
            } else {
                localStorage.setItem(localKey, JSON.stringify(prevOrders.map(o => o.id === newOrder.id ? { ...o, ...newOrder } : o)));
            }
            
            const storageEvent = new Event('storage');
            storageEvent.key = localKey;
            window.dispatchEvent(storageEvent);

            // EventBus: notificar a otros módulos
            emit('pedido_creado', newOrder);

            // Intentar enviar al API real
            const res = await apiRequest('/pedidos', {
                method: 'POST',
                headers: { 'X-Negocio-ID': negocioId },
                body: JSON.stringify(newOrder)
            });
            return { success: true, orderId: res.data?.orderId || newOrder.id };
        } catch (error) {
            console.warn("Backend offline, order saved only locally:", error);
            return { success: true, local: true };
        }
    }, [negocioId]);

    const updateOrderStatus = useCallback(async (id, newStatus) => {
        try {
            console.log('[PedidosContext] Iniciando cambio de estado:', id, '->', newStatus);
            
            // 1. ACTUALIZACIÓN DE ESTADO INMEDIATA (Optimismo UI)
            setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, status: newStatus, estado: newStatus, ...(newStatus === 'paid' ? { paid: true } : {}) } : o));

            // 2. PERSISTENCIA TENANT-SPECIFIC
            const localKey = `${negocioId}_orders`;
            let localData = JSON.parse(localStorage.getItem(localKey)) || [];
            localData = localData.map(o => {
                if (String(o.id) === String(id)) {
                    return { ...o, status: newStatus, estado: newStatus, ...(newStatus === 'paid' ? { paid: true } : {}) };
                }
                return o;
            });
            localStorage.setItem(localKey, JSON.stringify(localData));

            // 3. PERSISTENCIA GLOBAL (Giovanni Fix)
            let globalData = JSON.parse(localStorage.getItem("giovanni_orders")) || [];
            globalData = globalData.map(o => {
                if (String(o.id) === String(id)) {
                    return { ...o, status: newStatus, estado: newStatus, ...(newStatus === 'paid' ? { paid: true } : {}) };
                }
                return o;
            });
            localStorage.setItem("giovanni_orders", JSON.stringify(globalData));

            // Disparar evento de sincronización para otras pestañas
            window.dispatchEvent(new Event('storage'));

            // Notificar al sistema
            emit('pedido_actualizado', { id, status: newStatus });

            // 4. PERSISTENCIA REMOTA (Firebase)
            try {
                await apiRequest(`/pedidos/${id}`, {
                    method: 'PUT',
                    headers: { 'X-Negocio-ID': negocioId },
                    body: JSON.stringify({ 
                        status: newStatus,
                        estado: newStatus,
                        updatedAt: Date.now() 
                    })
                });
            } catch (err) {
                console.warn("API update falló, se mantiene el sync local:", err);
            }

        } catch (error) {
            console.error("Error crítico en updateOrderStatus:", error);
        }
    }, [negocioId]);

    // Performance: useMemo to recalculate context values ONLY when dependencies change
    const value = useMemo(() => ({
        orders,
        barProducts,
        loading,
        addOrder,
        updateOrderStatus,
        setOrders,
        isBarOpen: () => true 
    }), [orders, barProducts, loading, addOrder, updateOrderStatus, setOrders]);

    return (
        <PedidosContext.Provider value={value}>
            {children}
        </PedidosContext.Provider>
    );
}
