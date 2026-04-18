import { db } from '../../firebase/config';
import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc,
    serverTimestamp 
} from 'firebase/firestore';

export const clientesService = {
    getClientes: async (negocioId) => {
        const snap = await getDocs(collection(db, 'negocios', negocioId, 'clientes'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    saveCliente: async (negocioId, data) => {
        const id = data.id || `cli-${Date.now()}`;
        await setDoc(doc(db, 'negocios', negocioId, 'clientes', id), { ...data, id, createdAt: serverTimestamp() });
        return { success: true, id };
    },
    updateCliente: async (negocioId, id, updates) => {
        await setDoc(doc(db, 'negocios', negocioId, 'clientes', id), updates, { merge: true });
        return { success: true };
    },
    deleteCliente: async (negocioId, id) => {
        await deleteDoc(doc(db, 'negocios', negocioId, 'clientes', id));
    }
};
