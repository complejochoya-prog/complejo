import { db } from '../../firebase/config';
import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    query, 
    where, 
    limit,
    serverTimestamp,
    addDoc
} from 'firebase/firestore';

export const cajaService = {
    getCajaStatus: async (negocioId) => {
        const q = query(collection(db, 'negocios', negocioId, 'caja_sesiones'), where('status', '==', 'open'), limit(1));
        const snap = await getDocs(q);
        const session = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };

        const today = new Date().toISOString().split('T')[0];
        const movQ = query(collection(db, 'negocios', negocioId, 'caja_movements'), where('fecha', '==', today));
        const movSnap = await getDocs(movQ);
        const movements = movSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        return { session, movements };
    },

    addMovement: async (negocioId, data) => {
        const ref = collection(db, 'negocios', negocioId, 'caja_movements');
        const payload = {
            ...data,
            monto: parseFloat(data.monto) || 0,
            tipo: data.tipo || 'entrada',
            categoria: data.categoria || 'Varios',
            descripcion: data.descripcion || '',
            metodoPago: data.metodoPago || 'efectivo',
            origen: data.origen || 'general',
            usuario: data.usuario || 'Sistema',
            metadata: data.metadata || {},
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        };
        await setDoc(doc(db, 'negocios', negocioId, 'caja_movements', id), payload);
        return { success: true, movement: payload };
    },

    openCaja: async (negocioId, initialBalance, user) => {
        const id = `ses-${Date.now()}`;
        const session = {
            id,
            negocioId,
            status: 'open',
            openedAt: serverTimestamp(),
            openedBy: user,
            initialBalance: Number(initialBalance)
        };
        await setDoc(doc(db, 'negocios', negocioId, 'caja_sesiones', id), session);
        return { success: true, session };
    }
};
