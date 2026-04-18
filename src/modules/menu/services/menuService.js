import { db } from '../../../firebase/config';
import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    query, 
    where, 
    serverTimestamp 
} from 'firebase/firestore';

/**
 * menuService.js - Motor de Pedidos y Menú estilo Digital Board (Firestore)
 */

export const fetchPromosMenu = async (negocioId) => {
    if (!negocioId) return [];
    try {
        const q = query(collection(db, 'negocios', negocioId, 'promociones'), where('active', '==', true));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Error fetching promos menu:", e);
        return [];
    }
};

export const submitOrder = async (negocioId, orderData) => {
    if (!negocioId) return { success: false };
    const id = `ord-${Date.now()}`;
    const newOrder = {
        id,
        type: 'promo',
        status: 'pending',
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        ...orderData
    };
    
    await setDoc(doc(db, 'negocios', negocioId, 'pedidos', id), newOrder);
    
    return { success: true, orderId: id };
};
