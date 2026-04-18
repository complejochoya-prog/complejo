import { db } from '../../firebase/config';
import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    serverTimestamp 
} from 'firebase/firestore';

/**
 * CONFIGURACION & PANTALLAS (FIRESTORE)
 */
export const configService = {
    getPantallas: async (negocioId) => {
        const snap = await getDocs(collection(db, 'negocios', negocioId, 'pantallas'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    savePantalla: async (negocioId, data) => {
        const id = data.id || `pan-${Date.now()}`;
        await setDoc(doc(db, 'negocios', negocioId, 'pantallas', id), { ...data, id, updatedAt: serverTimestamp() });
    },
    getPromos: async (negocioId) => {
        const snap = await getDocs(collection(db, 'negocios', negocioId, 'promociones'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    savePromo: async (negocioId, data) => {
        const id = data.id || `prm-${Date.now()}`;
        await setDoc(doc(db, 'negocios', negocioId, 'promociones', id), { ...data, id, updatedAt: serverTimestamp() });
    }
};
