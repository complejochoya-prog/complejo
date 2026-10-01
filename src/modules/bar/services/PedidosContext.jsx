import { db } from '../../../firebase/config';
import {
    collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc,
    deleteDoc, addDoc, getDoc, getDocs, limit, serverTimestamp, where
} from 'firebase/firestore';
import React, {
    createContext, useContext, useState, useEffect,
    useCallback, useRef, useMemo
} from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import { emit, on, off } from '../../../core/events/eventBus';

/**
 * PEDIDOS CONTEXT v4.1 — BLACK-SCREEN FIX
 *
 * Fixes aplicados:
 * 1. onSnapshot callback envuelto en try-catch → nunca lanza excepción no capturada.
 * 2. Eliminado el setOrders optimista redundante de updateOrderStatus.
 *    Firestore SDK dispara onSnapshot INMEDIATAMENTE con el write local (cache),
 *    por lo que el optimismo ya está resuelto por el SDK. El doble setOrders
 *    causaba dos re-renders en conflicto en React 18 Concurrent Mode.
 * 3. Chequeado d.metadata.hasPendingWrites: si serverTimestamp() aún no resolvió
 *    (pending write), el campo es null. Se usa fallback seguro en lugar de asumir Date.
 * 4. Eliminada la carga inicial duplicada desde localStorage (el onSnapshot la cubre).
 * 5. sanitizeForFirestore movido fuera del componente (era recreado en cada render).
 * 6. localStorage updates en updateOrderStatus eliminados (onSnapshot los hace).
 */

const PedidosContext = createContext({});

export function usePedidos() {
    return useContext(PedidosContext);
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Elimina campos undefined (Firestore los rechaza).
 * Convierte Firestore Timestamps anidados en ISO strings para que
 * JSON.stringify no produzca objetos { seconds, nanoseconds } raros.
 */
function sanitizeForFirestore(obj) {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
    // Firestore Timestamp → devolver como está (Firestore lo acepta)
    if (obj && typeof obj === 'object' && typeof obj.toDate === 'function') return obj;
    if (obj instanceof Date) return obj;
    if (typeof obj === 'object') {
        const clean = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
                clean[key] = sanitizeForFirestore(value);
            }
        }
        return clean;
    }
    return obj;
}

/**
 * Convierte cualquier valor de timestamp de Firestore a JS Date de forma segura.
 * Si falla, devuelve null (nunca lanza).
 */
function toSafeDate(val) {
    if (!val) return null;
    try {
        if (val instanceof Date) return val;
        if (typeof val.toDate === 'function') return val.toDate();
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    } catch {
        return null;
    }
}

/**
 * Convierte un documento de Firestore en un objeto plano seguro para React y JSON.
 * No deja Firestore Timestamps sueltos en el objeto resultante.
 */
function docToOrder(d) {
    const data = d.data();
    const isPending = d.metadata?.hasPendingWrites;

    // timestamp: si el write está pendiente, serverTimestamp() = null → fallback a updatedAt o ahora
    const ts =
        toSafeDate(data.timestamp) ||
        toSafeDate(data.createdAt) ||
        (isPending ? new Date() : new Date());

    return {
        // Primero spread data (con posibles Timestamps en campos secundarios),
        // luego overrides explícitos con valores seguros.
        ...data,
        id: d.id,
        timestamp: ts,
        // Normalizar updatedAt: si es null (pending serverTimestamp) no crashear
        updatedAt: toSafeDate(data.updatedAt) || null,
        createdAt: toSafeDate(data.createdAt) || ts,
        status: data.status || data.estado || 'nuevo',
        estado: data.estado || data.status || 'nuevo',
    };
}

// ── Provider ───────────────────────────────────────────────────────────────

export default function PedidosProvider({ children }) {
    const { negocioId } = useConfig();
    const [orders, setOrders] = useState([]);
    const [barProducts, setBarProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Notificación de sonido ───────────────────────────────────────────
    const notificationSound = useRef(null);
    const lastSoundTime = useRef(0);

    useEffect(() => {
        // Crear Audio solo en el cliente (evita crash en SSR o entornos sin Audio)
        try {
            notificationSound.current = new Audio(
                'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
            );
        } catch {
            notificationSound.current = null;
        }
    }, []);

    const playNotification = useCallback(() => {
        if (!notificationSound.current) return;
        const now = Date.now();
        if (now - lastSoundTime.current > 3000) {
            notificationSound.current.play().catch(() => {});
            lastSoundTime.current = now;
        }
    }, []);

    // ── Sincronización en tiempo real con Firestore ──────────────────────
    useEffect(() => {
        if (!negocioId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const qOrders = query(
            collection(db, 'negocios', negocioId, 'pedidos'),
            orderBy('timestamp', 'desc'),
            limit(100)
        );

        const unsubOrders = onSnapshot(
            qOrders,
            (snap) => {
                // ── FIX #1: todo el callback envuelto en try-catch ──────
                try {
                    const listFromFirestore = snap.docs.map(docToOrder);

                    setOrders(listFromFirestore);
                    setLoading(false);

                    // Persistencia local — también en try-catch para no crashear
                    // si JSON.stringify falla por algún dato inesperado
                    try {
                        // Serializar: los Timestamps ya fueron convertidos a Date por docToOrder,
                        // y JSON.stringify(Date) produce un ISO string válido.
                        const serialized = JSON.stringify(listFromFirestore, (key, value) => {
                            // Firestore Timestamp que pueda quedar en campos secundarios
                            if (value && typeof value === 'object' && typeof value.toDate === 'function') {
                                return value.toDate().toISOString();
                            }
                            return value;
                        });
                        localStorage.setItem(`${negocioId}_orders`, serialized);
                        localStorage.setItem('giovanni_orders', serialized);
                    } catch (serErr) {
                        console.warn('[PedidosContext] Error serializando a localStorage:', serErr);
                    }
                } catch (err) {
                    // ── FIX #1: nunca dejar que el callback lance al exterior ──
                    console.error('[PedidosContext] Error procesando snapshot:', err);
                    setLoading(false);
                }
            },
            (err) => {
                console.error('[PedidosContext] Firestore Subscription Error:', err);
                // Fallback: cargar desde caché local
                try {
                    const cached = JSON.parse(localStorage.getItem(`${negocioId}_orders`)) || [];
                    setOrders(cached);
                } catch {
                    setOrders([]);
                }
                setLoading(false);
            }
        );

        // Bar products
        const unsubProducts = onSnapshot(
            collection(db, 'negocios', negocioId, 'inventario'),
            (snap) => {
                try {
                    const list = snap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(p => p.sector === 'BAR');
                    setBarProducts(list);
                } catch (err) {
                    console.error('[PedidosContext] Error cargando productos:', err);
                }
            }
        );

        return () => {
            unsubOrders();
            unsubProducts();
        };
    }, [negocioId]);

    // ── Escucha global de pedidos creados externamente ───────────────────
    useEffect(() => {
        const handler = (pedido) => {
            if (!pedido) return;
            setOrders(prev => {
                if (prev.some(o => o.id === pedido.id)) return prev;
                return [pedido, ...prev];
            });
            try {
                const stored = JSON.parse(localStorage.getItem('giovanni_orders')) || [];
                if (!stored.some(o => o.id === pedido.id)) {
                    stored.unshift(pedido);
                    localStorage.setItem('giovanni_orders', JSON.stringify(stored));
                }
            } catch (e) {
                console.warn('[PedidosContext] Error guardando pedido en localStorage:', e);
            }
        };

        on('pedido_creado', handler);
        return () => off('pedido_creado', handler);
    }, []);

    // ── CRUD ─────────────────────────────────────────────────────────────

    const addOrder = useCallback(async (orderData) => {
        if (!negocioId) {
            console.error('[PedidosContext] addOrder: No negocioId');
            return { success: false, error: 'No Negocio ID' };
        }
        try {
            const orderId = orderData.id || `ORD-${Date.now()}`;
            const rawOrder = {
                ...orderData,
                id: orderId,
                negocioId,
                status: orderData.status || 'nuevo',
                estado: orderData.estado || 'nuevo',
                timestamp: serverTimestamp(),
                createdAt: orderData.createdAt || new Date().toISOString(),
            };
            const firestoreOrder = sanitizeForFirestore(rawOrder);
            firestoreOrder.timestamp = serverTimestamp(); // re-aplicar tras sanitize

            const localOrder = {
                ...firestoreOrder,
                timestamp: new Date().toISOString(),
            };

            const docRef = doc(db, 'negocios', negocioId, 'pedidos', String(orderId));
            await setDoc(docRef, firestoreOrder);

            // Descuento automático de stock en inventario para cada producto vendido
            if (Array.isArray(orderData.items)) {
                for (const item of orderData.items) {
                    const qty = Number(item.quantity || item.qty || item.cantidad || 1);
                    const prodId = item.id || item.productId;
                    if (prodId && !String(prodId).startsWith('3000') && !String(prodId).startsWith('3001')) {
                        try {
                            const prodRef = doc(db, 'negocios', negocioId, 'inventario', String(prodId));
                            const prodSnap = await getDoc(prodRef);
                            if (prodSnap.exists()) {
                                const currentStock = Number(prodSnap.data().stock || 0);
                                const newStock = Math.max(0, currentStock - qty);
                                await updateDoc(prodRef, {
                                    stock: newStock,
                                    stock_actual: newStock,
                                    disponible: newStock > 0,
                                    updatedAt: serverTimestamp()
                                });

                                const movId = `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                                await setDoc(doc(db, 'negocios', negocioId, 'inventario_movimientos', movId), {
                                    id: movId,
                                    productoId: String(prodId),
                                    productoNombre: item.name || item.nombre || prodSnap.data().nombre || 'Producto',
                                    tipo: 'Venta',
                                    cantidad: qty,
                                    origen: orderData.mozo ? `Venta Mozo: ${orderData.mozo}` : (orderData.tableNumber || orderData.mesa ? `Venta Mesa ${orderData.tableNumber || orderData.mesa}` : 'Venta Bar'),
                                    usuario: orderData.mozo || orderData.cliente?.nombre || 'Sistema',
                                    refId: orderId,
                                    timestamp: serverTimestamp()
                                });
                            }
                        } catch (stockErr) {
                            console.warn('[PedidosContext] Error descontando stock para item:', item, stockErr);
                        }
                    }
                }
            }

            // Cache local optimista
            try {
                const localKey = `${negocioId}_orders`;
                const prevOrders = JSON.parse(localStorage.getItem(localKey)) || [];
                if (!prevOrders.some(o => o.id === orderId)) {
                    localStorage.setItem(localKey, JSON.stringify([localOrder, ...prevOrders]));
                }
            } catch {}

            window.dispatchEvent(new Event('storage'));
            emit('pedido_creado', localOrder);

            return { success: true, orderId };
        } catch (error) {
            console.error('[PedidosContext] Error creando pedido:', error);
            return { success: false, error: error.message || error };
        }
    }, [negocioId]);

    /**
     * FIX #2: updateOrderStatus simplificado.
     *
     * Se eliminaron:
     *   - setOrders() optimista manual → el onSnapshot del SDK ya lo hace
     *     de forma inmediata por el write local (cache). Mantener ambos
     *     causaba dos re-renders en React 18 Concurrent Mode con datos
     *     en estados intermedios distintos → crash.
     *   - localStorage.setItem() redundante → el onSnapshot ya lo hace.
     *   - window.dispatchEvent → no había listeners, era ruido.
     *
     * Se conserva:
     *   - throw error → para que KitchenOrderCard muestre isUpdating=false si falla.
     */
    const updateOrderStatus = useCallback(async (id, newStatus) => {
        if (!negocioId) {
            console.error('[PedidosContext] updateOrderStatus: No negocioId');
            return;
        }
        try {
            const docRef = doc(db, 'negocios', negocioId, 'pedidos', String(id));
            await setDoc(
                docRef,
                {
                    status: newStatus,
                    estado: newStatus,
                    paid: newStatus === 'paid',
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );
            // El onSnapshot del SDK dispara inmediatamente con el write local
            // y actualiza setOrders automáticamente. No se necesita nada más aquí.
            emit('pedido_actualizado', { id, status: newStatus });
        } catch (error) {
            console.error('[PedidosContext] Error actualizando estado:', error);
            throw error; // re-throw para que el botón vuelva a estar activo
        }
    }, [negocioId]);

    const updateOrder = useCallback(async (id, updates) => {
        if (!negocioId) return;
        try {
            const cleanUpdates = sanitizeForFirestore(updates);
            cleanUpdates.updatedAt = serverTimestamp();
            const docRef = doc(db, 'negocios', negocioId, 'pedidos', String(id));
            await setDoc(docRef, cleanUpdates, { merge: true });
            // onSnapshot se encarga del setOrders
        } catch (error) {
            console.error('[PedidosContext] Error actualizando pedido:', error);
        }
    }, [negocioId]);

    const value = useMemo(() => ({
        orders,
        barProducts,
        loading,
        addOrder,
        updateOrder,
        updateOrderStatus,
        setOrders,
        isBarOpen: () => true,
    }), [orders, barProducts, loading, addOrder, updateOrder, updateOrderStatus]);

    return (
        <PedidosContext.Provider value={value}>
            {children}
        </PedidosContext.Provider>
    );
}
