import { cajaService } from '../../../core/services/firestoreService';

export const fetchCajaStatus = async (negocioId) => {
    const { session, movements } = await cajaService.getCajaStatus(negocioId);
    const today = new Date().toISOString().split('T')[0];
    const todayMovements = movements.filter(m => m.fecha === today);
    
    // Simplificado para la UI
    const ingresos = todayMovements.filter(m => m.tipo === 'entrada').reduce((a, b) => a + Number(b.monto), 0);
    const egresos = todayMovements.filter(m => m.tipo === 'salida').reduce((a, b) => a + Number(b.monto), 0);

    return {
        session,
        stats: {
            totalBalance: session ? (Number(session.initialAmount || session.initialBalance || 0) + ingresos - egresos) : 0,
            ingresosHoy: ingresos,
            egresosHoy: egresos,
            gananciaHoy: ingresos - egresos
        },
        movements: todayMovements
    };
};

export const addMovement = async (negocioId, data) => cajaService.addMovement(negocioId, data);
export const deleteMovement = async (negocioId, id) => {
    const { deleteDoc, doc, db } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'negocios', negocioId, 'caja_movements', id));
    return { success: true };
};

export const openCaja = async (negocioId, balance, user) => cajaService.openCaja(negocioId, balance, user);

export const closeCaja = async (negocioId, user) => {
    const status = await fetchCajaStatus(negocioId);
    if (!status.session) return { success: false };
    
    const { updateDoc, doc, db, serverTimestamp } = await import('firebase/firestore');
    await updateDoc(doc(db, 'negocios', negocioId, 'caja_sesiones', status.session.id), {
        status: 'closed',
        closedAt: serverTimestamp(),
        closedBy: user,
        finalBalance: status.stats.totalBalance
    });
    return { success: true };
};

export const fetchSessionsHistory = async (negocioId) => {
    const { getDocs, query, collection, where, db, orderBy } = await import('firebase/firestore');
    const q = query(collection(db, 'negocios', negocioId, 'caja_sesiones'), where('status', '==', 'closed'), orderBy('closedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const fetchAllMovements = async (negocioId, filters = {}) => {
    const { getDocs, query, collection, db, orderBy } = await import('firebase/firestore');
    const q = query(collection(db, 'negocios', negocioId, 'caja_movements'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (filters.fecha) list = list.filter(m => m.fecha === filters.fecha);
    if (filters.tipo) list = list.filter(m => m.tipo === filters.tipo);
    return list;
};

export const registerExternalMovement = async (negocioId, data) => cajaService.addMovement(negocioId, data);
