import { db } from '../../../firebase/config';
import {
    collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc, deleteDoc, addDoc, getDoc, getDocs, limit, serverTimestamp, where
} from 'firebase/firestore';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
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

        // loadLocalOnly removed to avoid ghost data conflicts. 
        // We rely 100% on Firebase for cross-device consistency.
        
        // 2. FIRESTORE REALTIME (SECURE)
        const qOrders = query(
            collection(db, 'negocios', negocioId, 'pedidos'), 
            orderBy('timestamp', 'desc'), 
            limit(100) 
        );
        
        const unsubOrders = onSnapshot(qOrders, (snap) => {
            const listFromFirestore = snap.docs.map(d => {
                const data = d.data();
                // ✅ Robust Timestamp handling (Firestore serverTimestamp can be null on local preview)
                let ts = new Date();
                if (data.timestamp?.toDate) ts = data.timestamp.toDate();
                else if (data.timestamp) ts = new Date(data.timestamp);
                else if (data.createdAt) ts = new Date(data.createdAt);

                return { 
                    id: d.id, 
                    ...data,
                    timestamp: ts,
                    status: data.status || data.estado || 'nuevo',
                    estado: data.estado || data.status || 'nuevo'
                };
            });
            
            // Filter out 'paid' orders older than 24h if needed, but for now we trust the limit(100)
            setOrders(listFromFirestore);
            setLoading(false);
            
            // Sync with local cache for persistence across refreshes
            localStorage.setItem(`${negocioId}_orders`, JSON.stringify(listFromFirestore));
            localStorage.setItem("giovanni_orders", JSON.stringify(listFromFirestore));
            
        }, (err) => {
            console.error("Firestore Subscription Error:", err);
            // Fallback load from cache
            const cached = JSON.parse(localStorage.getItem(`${negocioId}_orders`)) || [];
            setOrders(cached);
            setLoading(false);
        });

        // 3. Bar Products (Realtime)
        const unsubProducts = onSnapshot(collection(db, 'negocios', negocioId, 'inventario'), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.sector === 'BAR');
            setBarProducts(list);
        });

        return () => {
             unsubOrders();
             unsubProducts();
        };
    }, [negocioId]);

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

    // 🔥 ACCIONES UNIFICADAS (FIRMEZA EN BASE DE DATOS)
    
    // Helper: Firestore rechaza campos con valor `undefined`. Esta función los elimina recursivamente.
    const sanitizeForFirestore = (obj) => {
        if (obj === null || obj === undefined) return null;
        if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
        if (typeof obj === 'object' && !(obj instanceof Date)) {
            const clean = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value !== undefined) {
                    clean[key] = sanitizeForFirestore(value);
                }
            }
            return clean;
        }
        return obj;
    };

    const addOrder = useCallback(async (orderData) => {
        if (!negocioId) {
            console.error('[PedidosContext] addOrder failed: No negocioId');
            return { success: false, error: 'No Negocio ID' };
        }
        
        try {
            const orderId = orderData.id || `ORD-${Date.now()}`;
            
            // 1. Objeto para Firestore (con serverTimestamp)
            const rawOrder = { 
                ...orderData, 
                id: orderId,
                negocioId,
                status: orderData.status || 'nuevo',
                estado: orderData.estado || 'nuevo',
                timestamp: serverTimestamp(),
                createdAt: orderData.createdAt || new Date().toISOString()
            };

            // 🛡️ Sanitizar: eliminar todos los campos `undefined` antes de enviar a Firestore
            const firestoreOrder = sanitizeForFirestore(rawOrder);
            // Re-aplicar serverTimestamp (sanitize lo puede convertir en objeto plano)
            firestoreOrder.timestamp = serverTimestamp();

            // 2. Objeto para Local (con Date real para evitar errores de serialización)
            const localOrder = {
                ...firestoreOrder,
                timestamp: new Date().toISOString()
            };

            console.log('[PedidosContext] Saving order to Firestore:', orderId);
            const docRef = doc(db, 'negocios', negocioId, 'pedidos', String(orderId));
            await setDoc(docRef, firestoreOrder);

            // 3. Cache Local (Optimismo)
            const localKey = `${negocioId}_orders`;
            const prevOrders = JSON.parse(localStorage.getItem(localKey)) || [];
            if (!prevOrders.some(o => o.id === orderId)) {
                localStorage.setItem(localKey, JSON.stringify([localOrder, ...prevOrders]));
            }

            window.dispatchEvent(new Event('storage'));
            emit('pedido_creado', localOrder);

            return { success: true, orderId };
        } catch (error) {
            console.error("Critical error adding order to Firebase:", error);
            return { success: false, error: error.message || error };
        }
    }, [negocioId]);

    const updateOrderStatus = useCallback(async (id, newStatus) => {
        if (!negocioId) {
            console.error('[PedidosContext] Cannot update status: No negocioId');
            return;
        }

        try {
            console.log('[PedidosContext] Syncing Status update to Firebase:', id, '->', newStatus);
            
            // 1. Actualización en Firestore (Usamos setDoc + merge para que sea "Self-Healing")
            // Si por alguna razón el pedido no existía en la nube, esto lo creará con el estado nuevo.
            const docRef = doc(db, 'negocios', negocioId, 'pedidos', String(id));
            await setDoc(docRef, {
                status: newStatus,
                estado: newStatus,
                paid: newStatus === 'paid',
                updatedAt: serverTimestamp()
            }, { merge: true });

            // 2. Actualización Local (Optimismo UI)
            setOrders(prev => prev.map(o => String(o.id) === String(id) 
                ? { ...o, status: newStatus, estado: newStatus, paid: newStatus === 'paid' } 
                : o
            ));

            // Sync LocalStorage
            const localKey = `${negocioId}_orders`;
            let localData = JSON.parse(localStorage.getItem(localKey)) || [];
            localData = localData.map(o => String(o.id) === String(id) 
                ? { ...o, status: newStatus, estado: newStatus, paid: newStatus === 'paid' } 
                : o
            );
            localStorage.setItem(localKey, JSON.stringify(localData));
            
            window.dispatchEvent(new Event('storage'));
            emit('pedido_actualizado', { id, status: newStatus });

        } catch (error) {
            console.error("Error syncing status to Firebase:", error);
            throw error; // Rethrow to let the UI know
        }
    }, [negocioId]);

    const updateOrder = useCallback(async (id, updates) => {
        if (!negocioId) return;
        try {
            const cleanUpdates = sanitizeForFirestore(updates);
            cleanUpdates.updatedAt = serverTimestamp();
            const docRef = doc(db, 'negocios', negocioId, 'pedidos', String(id));
            await setDoc(docRef, cleanUpdates, { merge: true });
            
            // Optimistic update
            setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, ...updates } : o));
            
            // Sync LocalStorage
            const localKey = `${negocioId}_orders`;
            let localData = JSON.parse(localStorage.getItem(localKey)) || [];
            localData = localData.map(o => String(o.id) === String(id) ? { ...o, ...updates } : o);
            localStorage.setItem(localKey, JSON.stringify(localData));
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error("Error updating order:", error);
        }
    }, [negocioId]);

    // Performance: useMemo to recalculate context values ONLY when dependencies change
    const value = useMemo(() => ({
        orders,
        barProducts,
        loading,
        addOrder,
        updateOrder,
        updateOrderStatus,
        setOrders,
        isBarOpen: () => true 
    }), [orders, barProducts, loading, addOrder, updateOrder, updateOrderStatus, setOrders]);

    return (
        <PedidosContext.Provider value={value}>
            {children}
        </PedidosContext.Provider>
    );
}
