import { db } from '../../../firebase/config';
import { cajaService } from '../../../core/services/cajaService';
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp 
} from 'firebase/firestore';

export const calculateStats = (movements, session) => {
    if (!session || (session.status !== 'open' && !session.isOpen)) {
        return {
            totalBalance: 0,
            ingresosHoy: 0,
            egresosHoy: 0,
            gananciaHoy: 0,
            barVentas: 0,
            reservasVentas: 0,
            deliveryVentas: 0,
            porEfectivo: 0,
            porTransferencia: 0,
            porMercadopago: 0,
            processedMovements: []
        };
    }

    // Determine session start time in milliseconds
    const sessionStartMs = session.openedAtMs 
        || (session.openedAt?.toMillis ? session.openedAt.toMillis() : null)
        || (session.openedAt?.seconds ? session.openedAt.seconds * 1000 : null)
        || (session.createdAt ? new Date(session.createdAt).getTime() : 0);

    // Only include movements registered during THIS open session
    const sessionMovements = (movements || []).filter(m => {
        if (m.sessionId && session.id) {
            return m.sessionId === session.id;
        }
        if (sessionStartMs && m.timestamp?.toMillis) {
            return m.timestamp.toMillis() >= (sessionStartMs - 2000);
        }
        if (sessionStartMs && m.timestamp?.seconds) {
            return (m.timestamp.seconds * 1000) >= (sessionStartMs - 2000);
        }
        if (sessionStartMs && m.createdAt) {
            return new Date(m.createdAt).getTime() >= (sessionStartMs - 2000);
        }
        return false;
    });

    const initial = Number(session.initialBalance || session.initialAmount || 0);
    
    const ingresos = sessionMovements.filter(m => m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto || 0), 0);
    const egresos = sessionMovements.filter(m => m.tipo === 'salida').reduce((a, b) => a + Number(b.monto || 0), 0);
    
    const barVentas = sessionMovements.filter(m => m.origen === 'bar' && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto || 0), 0);
    const reservasVentas = sessionMovements.filter(m => m.origen === 'reserva' && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto || 0), 0);
    const deliveryVentas = sessionMovements.filter(m => m.origen === 'delivery' && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto || 0), 0);

    const porEfectivo = sessionMovements.filter(m => (m.metodo_pago === 'efectivo' || m.metodoPago === 'efectivo') && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto || 0), 0);
    const porTransferencia = sessionMovements.filter(m => (m.metodo_pago === 'transferencia' || m.metodoPago === 'transferencia') && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto || 0), 0);
    const porMercadopago = sessionMovements.filter(m => (m.metodo_pago === 'mercadopago' || m.metodoPago === 'mercadopago') && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto || 0), 0);

    return {
        totalBalance: initial + ingresos - egresos,
        ingresosHoy: ingresos,
        egresosHoy: egresos,
        gananciaHoy: ingresos - egresos,
        barVentas,
        reservasVentas,
        deliveryVentas,
        porEfectivo,
        porTransferencia,
        porMercadopago,
        processedMovements: sessionMovements
    };
};

export const fetchCajaStatus = async (negocioId) => {
    try {
        const { session, movements } = await cajaService.getCajaStatus(negocioId);
        const stats = calculateStats(movements, session);
        
        return {
            session: session ? { ...session, isOpen: session.status === 'open' } : null,
            stats,
            movements: stats.processedMovements
        };
    } catch (error) {
        console.error("Error in fetchCajaStatus:", error);
        return { session: null, stats: {}, movements: [] };
    }
};

export const addMovement = async (negocioId, data) => cajaService.addMovement(negocioId, data);

export const deleteMovement = async (negocioId, id) => {
    try {
        await deleteDoc(doc(db, 'negocios', negocioId, 'caja_movements', id));
        return { success: true };
    } catch (error) {
        console.error("Error deleting movement:", error);
        return { success: false, error };
    }
};

export const openCaja = async (negocioId, balance, user) => cajaService.openCaja(negocioId, balance, user);

export const closeCaja = async (negocioId, user = 'Administrador', closeDetails = {}) => {
    try {
        const status = await fetchCajaStatus(negocioId);
        if (!status.session) return { success: false, error: 'No hay sesión abierta' };
        
        const initialBalance = Number(status.session.initialBalance || status.session.initialAmount || 0);
        const totalIngresos = Number(closeDetails.totalIngresos ?? status.stats.ingresosHoy ?? 0);
        const totalEgresos = Number(closeDetails.totalEgresos ?? status.stats.egresosHoy ?? 0);
        const porEfectivo = Number(closeDetails.porEfectivo ?? status.stats.porEfectivo ?? 0);
        const porTransferencia = Number(closeDetails.porTransferencia ?? status.stats.porTransferencia ?? 0);
        const porMercadopago = Number(closeDetails.porMercadopago ?? status.stats.porMercadopago ?? 0);
        
        // Expected cash in drawer = initial cash + cash income - expenses
        const efectivoEsperado = initialBalance + porEfectivo - totalEgresos;
        const efectivoReal = closeDetails.efectivoReal !== undefined && closeDetails.efectivoReal !== ''
            ? Number(closeDetails.efectivoReal) 
            : efectivoEsperado;
        const diferencia = closeDetails.diferencia !== undefined 
            ? Number(closeDetails.diferencia) 
            : (efectivoReal - efectivoEsperado);
            
        const finalBalance = efectivoReal; // Available cash to carry over to next day

        const sessionRef = doc(db, 'negocios', negocioId, 'caja_sesiones', status.session.id);
        
        const updateData = {
            status: 'closed',
            closedAt: serverTimestamp(),
            closedBy: user || 'Administrador',
            initialBalance,
            totalIngresos,
            totalEgresos,
            ganancia: totalIngresos - totalEgresos,
            efectivoEsperado,
            efectivoReal,
            diferencia,
            finalBalance,
            desglose: {
                efectivo: porEfectivo,
                transferencia: porTransferencia,
                mercadopago: porMercadopago
            },
            resumenOrigen: {
                bar: Number(status.stats.barVentas || 0),
                reservas: Number(status.stats.reservasVentas || 0),
                delivery: Number(status.stats.deliveryVentas || 0)
            },
            observaciones: closeDetails.observaciones || '',
            movementsCount: status.movements?.length || 0,
            movementsSnapshot: (status.movements || []).map(m => ({
                id: m.id || '',
                descripcion: m.descripcion || m.categoria || 'Movimiento',
                categoria: m.categoria || '',
                tipo: m.tipo || 'entrada',
                monto: Number(m.monto || 0),
                metodoPago: m.metodoPago || m.metodo_pago || 'efectivo',
                origen: m.origen || 'general',
                hora: m.hora || ''
            }))
        };

        await updateDoc(sessionRef, updateData);
        return { 
            success: true, 
            closedSession: { 
                id: status.session.id, 
                ...status.session, 
                ...updateData,
                closedAt: new Date().toISOString() 
            } 
        };
    } catch (error) {
        console.error("Error closing caja:", error);
        return { success: false, error: error.message || error };
    }
};

export const fetchLastClosedSession = async (negocioId) => {
    try {
        const q = query(collection(db, 'negocios', negocioId, 'caja_sesiones'), where('status', '==', 'closed'));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => {
            const dateA = a.closedAt?.toMillis ? a.closedAt.toMillis() : (a.closedAt ? new Date(a.closedAt).getTime() : 0);
            const dateB = b.closedAt?.toMillis ? b.closedAt.toMillis() : (b.closedAt ? new Date(b.closedAt).getTime() : 0);
            return dateB - dateA;
        });
        return docs[0] || null;
    } catch (error) {
        console.error("Error fetching last closed session:", error);
        return null;
    }
};

export const fetchSessionsHistory = async (negocioId) => {
    try {
        const q = query(collection(db, 'negocios', negocioId, 'caja_sesiones'), where('status', '==', 'closed'));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return docs.sort((a, b) => {
            const dateA = a.closedAt?.toMillis ? a.closedAt.toMillis() : (a.closedAt ? new Date(a.closedAt).getTime() : 0);
            const dateB = b.closedAt?.toMillis ? b.closedAt.toMillis() : (b.closedAt ? new Date(b.closedAt).getTime() : 0);
            return dateB - dateA;
        });
    } catch (error) {
        console.error("Error fetching sessions history:", error);
        return [];
    }
};

export const fetchAllMovements = async (negocioId, filters = {}) => {
    try {
        const q = query(collection(db, 'negocios', negocioId, 'caja_movements'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (filters.fecha) list = list.filter(m => m.fecha === filters.fecha);
        if (filters.tipo) list = list.filter(m => m.tipo === filters.tipo);
        return list;
    } catch (error) {
        console.error("Error fetching all movements:", error);
        return [];
    }
};

export const registerExternalMovement = async (negocioId, data) => cajaService.addMovement(negocioId, data);
