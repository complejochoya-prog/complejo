import { db } from '../../firebase/config';
import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    serverTimestamp 
} from 'firebase/firestore';

export const tablasService = {
    getTablas: async (negocioId) => {
        const snap = await getDocs(collection(db, 'negocios', negocioId, 'tablas'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    updateTabla: async (negocioId, tableNumber, updates) => {
        await setDoc(doc(db, 'negocios', negocioId, 'tablas', `table-${tableNumber}`), { 
            ...updates, 
            tableNumber, 
            updatedAt: serverTimestamp() 
        }, { merge: true });
    }
};
