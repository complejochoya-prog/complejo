import { db } from '../../../firebase/config';
import { 
    collection, doc, getDocs, setDoc, updateDoc, 
    deleteDoc, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

const DEFAULT_ESPACIOS = [
    { 
        id: 'esp-1', 
        name: 'Fútbol 5 sintético', 
        desc: 'Cesped PRO-FIFA', 
        category: 'Deportes Interés',
        img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800',
        active: true,
        order: 1
    },
    { 
        id: 'esp-2', 
        name: 'Fútbol 7 profesional', 
        desc: 'Iluminación LED', 
        category: 'Deportes Interés',
        img: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=800',
        active: true,
        order: 2
    },
    { 
        id: 'esp-3', 
        name: 'Padel Glass Pro', 
        desc: 'Canchas vidriadas', 
        category: 'Deportes Interés',
        img: 'https://images.unsplash.com/photo-1626245917164-214273c248ca?q=80&w=800',
        active: true,
        order: 3
    },
];

export const fetchEspacios = async (negocioId) => {
    if (!negocioId) return [];
    try {
        const q = query(collection(db, 'negocios', negocioId, 'espacios'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        
        if (snap.empty) return DEFAULT_ESPACIOS;
        
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Error fetching espacios:", e);
        return DEFAULT_ESPACIOS;
    }
};

export const saveEspacio = async (negocioId, espacio, currentList = []) => {
    if (!negocioId) return false;
    const id = espacio.id || `esp-${Date.now()}`;
    const ref = doc(db, 'negocios', negocioId, 'espacios', id);
    
    // Ensure order exists so it appears in ordered queries
    const order = espacio.order || (currentList.length + 1);
    
    await setDoc(ref, {
        ...espacio,
        id,
        order,
        updatedAt: serverTimestamp()
    }, { merge: true });
    
    return true;
};

export const deleteEspacio = async (negocioId, id) => {
    if (!negocioId) return false;
    await deleteDoc(doc(db, 'negocios', negocioId, 'espacios', id));
    return true;
};

export const toggleEspacioStatus = async (negocioId, id, currentStatus) => {
    if (!negocioId) return false;
    await updateDoc(doc(db, 'negocios', negocioId, 'espacios', id), {
        active: !currentStatus,
        updatedAt: serverTimestamp()
    });
    return true;
};

export const reorderEspacios = async (negocioId, id, direction, list) => {
    if (!negocioId) return;
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return;

    const newList = [...list];
    if (direction === 'up' && idx > 0) {
        [newList[idx], newList[idx - 1]] = [newList[idx - 1], newList[idx]];
    } else if (direction === 'down' && idx < newList.length - 1) {
        [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
    }

    // Save all orders using setDoc to handle potentially non-existent docs (from defaults)
    for (let i = 0; i < newList.length; i++) {
        const ref = doc(db, 'negocios', negocioId, 'espacios', newList[i].id);
        await setDoc(ref, { 
            ...newList[i],
            order: i + 1 
        }, { merge: true });
    }
};
