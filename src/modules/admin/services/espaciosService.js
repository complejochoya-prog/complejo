import { db } from '../../../firebase/config';
import { 
    collection, doc, getDocs, setDoc, updateDoc, 
    deleteDoc, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

const getTenantDefaultEspacios = (negocioId) => [
    { 
        id: `esp-${negocioId}-1`, 
        name: negocioId.includes('padel') ? 'Padel Glass Pro 1' : 'Fútbol 5 sintético', 
        desc: negocioId.includes('padel') ? 'Canchas vidriadas de última generación' : 'Cesped PRO-FIFA con iluminación LED', 
        category: 'Deportes Interés',
        img: negocioId.includes('padel') 
            ? 'https://images.unsplash.com/photo-1626245917164-214273c248ca?q=80&w=800'
            : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800',
        active: true,
        order: 1,
        precio: negocioId.includes('padel') ? 12000 : 15000,
        precio_noche: negocioId.includes('padel') ? 15000 : 18000,
        requiereCantidad: false
    },
    { 
        id: `esp-${negocioId}-2`, 
        name: negocioId.includes('padel') ? 'Padel Panorámica 2' : 'Fútbol 7 profesional', 
        desc: negocioId.includes('padel') ? 'Cancha panorámica techada' : 'Cancha de fútbol 7 con césped premium', 
        category: 'Deportes Interés',
        img: negocioId.includes('padel')
            ? 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800'
            : 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=800',
        active: true,
        order: 2,
        precio: negocioId.includes('padel') ? 14000 : 22000,
        precio_noche: negocioId.includes('padel') ? 17000 : 26000,
        requiereCantidad: false
    }
];

export const fetchEspacios = async (negocioId) => {
    if (!negocioId) return [];
    
    // 1. Check local storage cache first
    let localData = null;
    try {
        const cached = localStorage.getItem(`complejo_espacios_${negocioId}`);
        if (cached) {
            localData = JSON.parse(cached);
        }
    } catch(e) {}

    try {
        const q = query(collection(db, 'negocios', negocioId, 'espacios'));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const sorted = data.sort((a, b) => (a.order || 999) - (b.order || 999));
            try {
                localStorage.setItem(`complejo_espacios_${negocioId}`, JSON.stringify(sorted));
            } catch(e) {}
            return sorted;
        }
        
        if (localData && Array.isArray(localData) && localData.length > 0) {
            return localData.sort((a, b) => (a.order || 999) - (b.order || 999));
        }

        // Initialize tenant defaults
        const defaults = getTenantDefaultEspacios(negocioId);
        try {
            localStorage.setItem(`complejo_espacios_${negocioId}`, JSON.stringify(defaults));
        } catch(e) {}
        
        // Save initial defaults to Firestore in background
        defaults.forEach(async (esp) => {
            try {
                await setDoc(doc(db, 'negocios', negocioId, 'espacios', esp.id), esp, { merge: true });
            } catch(e) {}
        });

        return defaults;
    } catch (e) {
        console.error("Error fetching espacios:", e);
        if (localData && Array.isArray(localData) && localData.length > 0) {
            return localData.sort((a, b) => (a.order || 999) - (b.order || 999));
        }
        return getTenantDefaultEspacios(negocioId);
    }
};

export const saveEspacio = async (negocioId, espacio, currentList = []) => {
    if (!negocioId) return false;
    const isNew = !espacio.id;
    const id = espacio.id || `esp-${negocioId}-${Date.now()}`;
    const order = espacio.order || (currentList.length + 1);
    
    const cleanEspacio = {
        ...espacio,
        id,
        order,
        ...(isNew ? { active: true } : {}),
        updatedAt: new Date().toISOString()
    };

    // 1. Update localStorage immediately
    try {
        const cached = localStorage.getItem(`complejo_espacios_${negocioId}`);
        let list = cached ? JSON.parse(cached) : [...currentList];
        const existingIdx = list.findIndex(e => e.id === id);
        if (existingIdx >= 0) {
            list[existingIdx] = { ...list[existingIdx], ...cleanEspacio };
        } else {
            list.push(cleanEspacio);
        }
        localStorage.setItem(`complejo_espacios_${negocioId}`, JSON.stringify(list));
        window.dispatchEvent(new Event('storage_espacios'));
    } catch(e) {}

    // 2. Save to Firestore
    try {
        const ref = doc(db, 'negocios', negocioId, 'espacios', id);
        await setDoc(ref, {
            ...cleanEspacio,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch(e) {
        console.warn("Firestore saveEspacio error:", e);
    }
    
    return true;
};

export const deleteEspacio = async (negocioId, id) => {
    if (!negocioId) return false;
    
    // 1. Update localStorage immediately
    try {
        const cached = localStorage.getItem(`complejo_espacios_${negocioId}`);
        if (cached) {
            let list = JSON.parse(cached);
            list = list.filter(e => e.id !== id);
            localStorage.setItem(`complejo_espacios_${negocioId}`, JSON.stringify(list));
            window.dispatchEvent(new Event('storage_espacios'));
        }
    } catch(e) {}

    // 2. Delete from Firestore
    try {
        await deleteDoc(doc(db, 'negocios', negocioId, 'espacios', id));
    } catch(e) {
        console.warn("Firestore deleteEspacio error:", e);
    }
    return true;
};

export const toggleEspacioStatus = async (negocioId, id, currentStatus) => {
    if (!negocioId) return false;
    
    // 1. Update localStorage
    try {
        const cached = localStorage.getItem(`complejo_espacios_${negocioId}`);
        if (cached) {
            let list = JSON.parse(cached);
            const idx = list.findIndex(e => e.id === id);
            if (idx >= 0) {
                list[idx].active = !currentStatus;
                localStorage.setItem(`complejo_espacios_${negocioId}`, JSON.stringify(list));
                window.dispatchEvent(new Event('storage_espacios'));
            }
        }
    } catch(e) {}

    // 2. Update Firestore
    try {
        await updateDoc(doc(db, 'negocios', negocioId, 'espacios', id), {
            active: !currentStatus,
            updatedAt: serverTimestamp()
        });
    } catch(e) {
        console.warn("Firestore toggleEspacioStatus error:", e);
    }
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

    const updated = newList.map((item, i) => ({ ...item, order: i + 1 }));

    // 1. Update localStorage
    try {
        localStorage.setItem(`complejo_espacios_${negocioId}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage_espacios'));
    } catch(e) {}

    // 2. Update Firestore
    for (let i = 0; i < updated.length; i++) {
        try {
            const ref = doc(db, 'negocios', negocioId, 'espacios', updated[i].id);
            await setDoc(ref, { 
                ...updated[i],
                order: i + 1 
            }, { merge: true });
        } catch(e) {}
    }
};
