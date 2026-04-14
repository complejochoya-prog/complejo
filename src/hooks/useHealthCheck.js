import { useState, useCallback } from 'react';
import { db } from '../firebase/config';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { useConfig } from '../modules/core/services/ConfigContext';
import { usePedidos } from '../modules/bar/services/PedidosContext';
import { useAuth } from '../modules/empleados/services/AuthContext';
import { useReservas } from '../modules/reservas/services/ReservasContext';
import { useCaja } from '../modules/caja/services/CajaContext';

export function useHealthCheck() {
    const { negocioId } = useConfig();
    const { orders } = usePedidos();
    const { users } = useAuth();
    const { isSlotBlocked } = useReservas();
    const { currentCaja } = useCaja();

    const [isChecking, setIsChecking] = useState(false);
    const [lastReport, setLastReport] = useState(null);

    const logEvent = async (message, details = {}) => {
        try {
            await addDoc(collection(db, 'negocios', negocioId, 'system_logs'), {
                timestamp: serverTimestamp(),
                message,
                negocio_id: negocioId,
                ...details
            });
        } catch (error) {
            console.error("Error writing to systemLogs:", error);
        }
    };

    const syncMenu = useCallback(() => {
        window.dispatchEvent(new Event('menuUpdated'));
    }, []);

    const syncAvailability = useCallback(async () => {
        console.log("Syncing availability...");
    }, []);

    const restartNotificationService = useCallback(() => {
        if ('vibrate' in navigator) navigator.vibrate(200);
        // Sound disabled per user request: soundEnabled: false
        console.log("Notification service checked (vibration only).");
    }, []);

    const runFullCheck = useCallback(async () => {
        setIsChecking(true);
        let errorsFixed = 0;
        let warnings = 0;

        const report = {
            productsReviewed: 0,
            errorsCorrected: 0,
            activeOrders: orders?.length || 0,
            activeMozos: users?.filter(u => u.role === 'mozo').length || 0,
            activeDelivery: users?.filter(u => u.role === 'delivery').length || 0,
            stockIssues: 0,
            stability: 100,
            warnings: 0,
            status: 'OK'
        };

        try {
            // 1. VERIFICACIÓN DE PRODUCTOS
            const productsSnap = await getDocs(collection(db, 'negocios', negocioId, 'productos'));
            report.productsReviewed = productsSnap.docs.length;

            for (const productDoc of productsSnap.docs) {
                const p = productDoc.data();
                let needsUpdate = false;
                const updates = {};

                if (p.price === undefined || p.price === null || p.price === 0) warnings++;
                if (!p.category) { updates.category = 'Otros'; needsUpdate = true; }
                if (typeof p.stock_actual === 'number' && p.stock_actual < 0) {
                    updates.stock_actual = 0;
                    updates.disponible = false;
                    needsUpdate = true;
                }
                if (p.stock_actual === 0 && p.disponible !== false) {
                    updates.disponible = false;
                    needsUpdate = true;
                    report.stockIssues++;
                }

                if (needsUpdate) {
                    await updateDoc(productDoc.ref, updates);
                    errorsFixed++;
                }
            }

            // 2. SINCRONIZACIÓN
            syncMenu();

            // 3. PEDIDOS
            const ordersSnap = await getDocs(collection(db, 'negocios', negocioId, 'orders'));
            for (const orderDoc of ordersSnap.docs) {
                const o = orderDoc.data();
                let needsUpdate = false;
                const updates = {};

                const items = o.productos || o.items || [];
                if (items.length === 0) {
                    console.log(`Eliminando pedido vacío/corrupto: ${orderDoc.id}`);
                    await deleteDoc(orderDoc.ref);
                    errorsFixed++;
                    continue;
                }

                if (needsUpdate) { await updateDoc(orderDoc.ref, updates); errorsFixed++; }
            }

            // 4. EMPLEADOS
            const usersSnap = await getDocs(collection(db, 'negocios', negocioId, 'usuarios'));
            for (const userDoc of usersSnap.docs) {
                const u = userDoc.data();
                if (!u.role) { await updateDoc(userDoc.ref, { role: 'Empleado' }); errorsFixed++; }
            }

            // 6. COCINA
            const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
            const delayedOrders = orders?.filter(o => {
                const status = (o.estado || o.status || '').toLowerCase();
                const isPending = status === 'pendiente' || status === 'confirmado';
                if (!isPending || !o.timestamp) return false;

                const orderTime = o.timestamp instanceof Date ? o.timestamp : (o.timestamp.toDate ? o.timestamp.toDate() : new Date(o.timestamp));
                return orderTime < thirtyMinsAgo;
            });
            if (delayedOrders?.length > 0) warnings += delayedOrders.length;

            // 7. NOTIFICACIONES
            restartNotificationService();

            // 8. RESERVAS
            const bookingsSnap = await getDocs(collection(db, 'negocios', negocioId, 'bookings'));
            for (const bookingDoc of bookingsSnap.docs) {
                const b = bookingDoc.data();
                if (!b.mesa) { await updateDoc(bookingDoc.ref, { status: 'Revisar' }); errorsFixed++; }
                if (isSlotBlocked && b.resourceId && b.date && b.time && isSlotBlocked(b.resourceId, b.date, b.time)) {
                    await updateDoc(bookingDoc.ref, { status: 'Revisar' });
                    errorsFixed++;
                }
            }

            // 9. HORARIOS
            await syncAvailability();

            report.errorsCorrected = errorsFixed;
            report.warnings = warnings;
            report.stability = Math.max(0, 100 - (errorsFixed * 2) - warnings);
            report.status = report.stability > 70 ? 'OK' : 'ERROR';

            if (errorsFixed > 0 || warnings > 0) await logEvent('Diagnóstico Automático Ejecutado', report);

            setLastReport(report);
            return report;
        } catch (error) {
            console.error("Health Check Failed:", error);
            await logEvent('Error crítico en HealthCheck', { error: error.message });
            throw error;
        } finally {
            setIsChecking(false);
        }
    }, [orders, users, isSlotBlocked, syncAvailability, syncMenu, restartNotificationService, negocioId]);

    return {
        isChecking,
        lastReport,
        runFullCheck,
        restartNotificationService,
        syncMenu,
        syncAvailability
    };
}
