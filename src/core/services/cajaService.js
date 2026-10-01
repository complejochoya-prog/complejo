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

export const getCajaStatus = async (negocioId) => {
    if (!negocioId) throw new Error("negocioId is required");
    try {
        const q = query(collection(db, 'negocios', negocioId, 'caja_sesiones'), where('status', '==', 'open'), limit(1));
        const snap = await getDocs(q);
        const session = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };

        const today = new Date().toISOString().split('T')[0];
        const movQ = query(collection(db, 'negocios', negocioId, 'caja_movements'), where('fecha', '==', today));
        const movSnap = await getDocs(movQ);
        const movements = movSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        return { session, movements };
    } catch (error) {
        console.error("Error in getCajaStatus:", error);
        return { session: null, movements: [] };
    }
};

export const addMovement = async (negocioId, data) => {
    if (!negocioId) return { success: false, error: "negocioId is required" };
    const ref = collection(db, 'negocios', negocioId, 'caja_movements');
    
    // Clean all undefined values to prevent Firestore rejection
    const cleanData = {};
    for (const [k, v] of Object.entries(data || {})) {
        if (v !== undefined) {
            cleanData[k] = v;
        }
    }

    const payload = {
        ...cleanData,
        monto: parseFloat(cleanData.monto) || 0,
        tipo: cleanData.tipo || 'entrada',
        categoria: cleanData.categoria || 'Varios',
        descripcion: cleanData.descripcion || '',
        metodoPago: cleanData.metodoPago || cleanData.metodo_pago || 'efectivo',
        origen: cleanData.origen || 'general',
        usuario: cleanData.usuario || cleanData.mozo || cleanData.repartidor || 'Sistema',
        metadata: cleanData.metadata || {},
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
    };
    
    const docRef = await addDoc(ref, payload);
    return { success: true, movement: { id: docRef.id, ...payload } };
};

export const openCaja = async (negocioId, initialBalance, user) => {
    const id = `ses-${Date.now()}`;
    const now = Date.now();
    const session = {
        id,
        negocioId,
        status: 'open',
        openedAt: serverTimestamp(),
        openedAtMs: now,
        openedBy: user || 'Cajero',
        initialBalance: Number(initialBalance) || 0,
        createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'negocios', negocioId, 'caja_sesiones', id), session);
    return { success: true, session };
};

// Exporting as an object for backward compatibility
export const cajaService = {
    getCajaStatus,
    addMovement,
    openCaja
};
