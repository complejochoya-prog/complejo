import { db } from '../../../firebase/config';
import { 
    collection, doc, getDocs, setDoc, updateDoc, 
    deleteDoc, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

const DEFAULT_PROMOS = [
    { 
        id: 'prm-birthday-1', 
        title: 'Festejo de Cumple (Pack Premium)', 
        desc: 'Para 10 personas\n• 5 pizzas de cualquier variedad\n• 10 tragos (mojito, daikiri o gin tonic)\n• 4 cervezas Heineken o Stella o 6 cocas de 1,5 lt\n• Incluye: 1 botella de champagne para brindar', 
        price: '140000',
        active: true,
        type: 'evento',
        img: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=800&auto=format&fit=crop'
    },
    { 
        id: 'prm-birthday-2', 
        title: 'Festejo de Cumple (Pack Clásico)', 
        desc: 'Para 10 personas\n• 3 pizzas de cualquier variedad\n• 4 porciones de papas\n• Docena de empanadas\n• 4 cervezas Heineken o 6 cocas 1,5 lt\n• Incluye: 1 botella de champagne para brindar', 
        price: '130000',
        active: true,
        type: 'evento',
        img: 'https://images.unsplash.com/photo-1534422298391-e4f8c170db06?q=80&w=800&auto=format&fit=crop'
    }
];

export const fetchPromos = async (negocioId) => {
    if (!negocioId) return [];
    try {
        const q = query(collection(db, 'negocios', negocioId, 'promociones'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        
        if (snap.empty) return DEFAULT_PROMOS;
        
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Error fetching promos:", e);
        return DEFAULT_PROMOS;
    }
};

export const savePromo = async (negocioId, promo) => {
    if (!negocioId) return false;
    const id = promo.id || `prm-${Date.now()}`;
    const ref = doc(db, 'negocios', negocioId, 'promociones', id);
    
    await setDoc(ref, {
        ...promo,
        id,
        createdAt: promo.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
    }, { merge: true });
    
    return true;
};

export const deletePromo = async (negocioId, id) => {
    if (!negocioId) return false;
    await deleteDoc(doc(db, 'negocios', negocioId, 'promociones', id));
    return true;
};

export const togglePromoStatus = async (negocioId, id, currentStatus) => {
    if (!negocioId) return false;
    await updateDoc(doc(db, 'negocios', negocioId, 'promociones', id), {
        active: !currentStatus,
        updatedAt: serverTimestamp()
    });
    return true;
};
