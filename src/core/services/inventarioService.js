import { db } from '../../firebase/config';
import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    increment,
    serverTimestamp,
    orderBy,
    deleteDoc
} from 'firebase/firestore';

export const inventarioService = {
    getProductos: async (negocioId, filters = {}) => {
        const ref = collection(db, 'negocios', negocioId, 'inventario');
        let q = query(ref, orderBy('nombre', 'asc'));
        
        if (filters.sector) q = query(ref, where('sector', '==', filters.sector));
        
        const snap = await getDocs(q);
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (filters.categoria) list = list.filter(p => p.categoria === filters.categoria);
        if (filters.alerta_stock) list = list.filter(p => p.stock <= p.stock_minimo);
        if (filters.buscar) {
            const search = filters.buscar.toLowerCase();
            list = list.filter(p => p.nombre.toLowerCase().includes(search) || (p.codigo && p.codigo.toLowerCase().includes(search)));
        }
        return list;
    },

    saveProducto: async (negocioId, data) => {
        const id = data.id || `pro-${Date.now()}`;
        const ref = doc(db, 'negocios', negocioId, 'inventario', id);
        const payload = { 
            ...data, 
            id, 
            negocioId, 
            updatedAt: serverTimestamp(),
            stock: Number(data.stock || 0),
            precio: Number(data.precio || 0)
        };
        await setDoc(ref, payload, { merge: true });
        return { success: true, producto: payload };
    },

    deleteProducto: async (negocioId, id) => {
        await deleteDoc(doc(db, 'negocios', negocioId, 'inventario', id));
    },

    registrarMovimiento: async (negocioId, mov) => {
        const movId = `mov-${Date.now()}`;
        
        // 1. Save movement
        await setDoc(doc(db, 'negocios', negocioId, 'inventario_movimientos', movId), {
            ...mov,
            id: movId,
            negocioId,
            timestamp: serverTimestamp()
        });

        // 2. Adjust stock
        const prodRef = doc(db, 'negocios', negocioId, 'inventario', mov.productoId);
        const adjustment = ['Ingreso', 'Ajuste_Positivo'].includes(mov.tipo) ? mov.cantidad : -mov.cantidad;
        
        await updateDoc(prodRef, {
            stock: increment(adjustment),
            updatedAt: serverTimestamp()
        });
        
        return { success: true };
    }
};
