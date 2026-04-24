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
    const today = new Date().toISOString().split('T')[0];
    const todayMovements = (movements || []).filter(m => m.fecha === today);
    
    const ingresos = todayMovements.filter(m => m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto), 0);
    const egresos = todayMovements.filter(m => m.tipo === 'salida').reduce((a, b) => a + Number(b.monto), 0);
    
    const barVentas = todayMovements.filter(m => m.origen === 'bar' && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto), 0);
    const reservasVentas = todayMovements.filter(m => m.origen === 'reserva' && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto), 0);
    const deliveryVentas = todayMovements.filter(m => m.origen === 'delivery' && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto), 0);

    const porEfectivo = todayMovements.filter(m => (m.metodo_pago === 'efectivo' || m.metodoPago === 'efectivo') && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto), 0);
    const porTransferencia = todayMovements.filter(m => (m.metodo_pago === 'transferencia' || m.metodoPago === 'transferencia') && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto), 0);
    const porMercadopago = todayMovements.filter(m => (m.metodo_pago === 'mercadopago' || m.metodoPago === 'mercadopago') && m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto), 0);

    return {
        totalBalance: session ? (Number(session.initialAmount || session.initialBalance || 0) + ingresos - egresos) : 0,
        ingresosHoy: ingresos,
        egresosHoy: egresos,
        gananciaHoy: ingresos - egresos,
        barVentas,
        reservasVentas,
        deliveryVentas,
        porEfectivo,
        porTransferencia,
        porMercadopago,
        processedMovements: todayMovements
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

export const closeCaja = async (negocioId, user) => {
    try {
        const status = await fetchCajaStatus(negocioId);
        if (!status.session) return { success: false };
        
        await updateDoc(doc(db, 'negocios', negocioId, 'caja_sesiones', status.session.id), {
            status: 'closed',
            closedAt: serverTimestamp(),
            closedBy: user,
            finalBalance: status.stats.totalBalance
        });
        return { success: true };
    } catch (error) {
        console.error("Error closing caja:", error);
        return { success: false, error };
    }
};

export const fetchSessionsHistory = async (negocioId) => {
    try {
        const q = query(collection(db, 'negocios', negocioId, 'caja_sesiones'), where('status', '==', 'closed'));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return docs.sort((a, b) => {
            const dateA = a.closedAt?.toMillis ? a.closedAt.toMillis() : 0;
            const dateB = b.closedAt?.toMillis ? b.closedAt.toMillis() : 0;
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
