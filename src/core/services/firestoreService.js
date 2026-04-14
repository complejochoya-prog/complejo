import { db } from '../../firebase/config';
import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    query, 
    where, 
    onSnapshot, 
    updateDoc, 
    increment,
    serverTimestamp,
    orderBy,
    limit,
    deleteDoc,
    addDoc
} from 'firebase/firestore';

/**
 * Migration Utility: Migrates data from localStorage to Firestore for a specific business.
 * This runs only once per business if localStorage data is found.
 */
export const migrateLocalStorageToFirestore = async (negocioId) => {
    if (!negocioId) return;
    
    const migrationFlag = `migration_done_${negocioId}`;
    if (localStorage.getItem(migrationFlag)) return;

    console.log(`[Migration] Starting migration for business: ${negocioId}`);

    try {
        // 1. Migrate Inventory
        const invKey = `${negocioId}_inventario_v3`;
        const products = JSON.parse(localStorage.getItem(invKey) || '[]');
        if (products.length > 0) {
            console.log(`[Migration] Migrating ${products.length} products...`);
            for (const p of products) {
                await setDoc(doc(db, 'negocios', negocioId, 'inventario', p.id), {
                    ...p,
                    negocioId,
                    updatedAt: serverTimestamp()
                });
            }
        }

        // 2. Migrate Inventory Movements
        const movKey = `${negocioId}_inventario_mov_v3`;
        const movements = JSON.parse(localStorage.getItem(movKey) || '[]');
        if (movements.length > 0) {
            console.log(`[Migration] Migrating ${movements.length} movements...`);
            for (const m of movements) {
                await setDoc(doc(db, 'negocios', negocioId, 'inventario_movimientos', m.id), {
                    ...m,
                    negocioId,
                    timestamp: m.timestamp || serverTimestamp()
                });
            }
        }

        // 3. Migrate Caja Session
        const cajaSessionKey = `${negocioId}_caja_current_session`;
        const session = JSON.parse(localStorage.getItem(cajaSessionKey));
        if (session) {
            console.log(`[Migration] Migrating open caja session...`);
            await setDoc(doc(db, 'negocios', negocioId, 'caja_sesiones', session.id), {
                ...session,
                negocioId,
                status: 'open',
                openedAt: session.openedAt ? new Date(session.openedAt) : serverTimestamp()
            });
        }

        // 4. Migrate Caja Movements
        const cajaMovKey = `${negocioId}_caja_movements`;
        const cajaMovements = JSON.parse(localStorage.getItem(cajaMovKey) || '[]');
        if (cajaMovements.length > 0) {
            console.log(`[Migration] Migrating ${cajaMovements.length} caja movements...`);
            for (const cm of cajaMovements) {
                await setDoc(doc(db, 'negocios', negocioId, 'caja_movimientos', cm.id), {
                    ...cm,
                    negocioId,
                    timestamp: cm.timestamp || serverTimestamp()
                });
            }
        }

        // 5. Migrate Reservas (Legacy)
        const resKey = 'complejo_reservas';
        const legacyReservas = JSON.parse(localStorage.getItem(resKey) || '[]');
        if (legacyReservas.length > 0) {
            console.log(`[Migration] Migrating ${legacyReservas.length} legacy reservations...`);
            for (const r of legacyReservas) {
                await addDoc(collection(db, 'negocios', negocioId, 'reservas'), {
                    ...r,
                    negocioId,
                    timestamp: serverTimestamp()
                });
            }
        }

        // Mark as done
        localStorage.setItem(migrationFlag, 'true');
        console.log(`[Migration] Successfully completed for: ${negocioId}`);
        
    } catch (error) {
        console.error(`[Migration] Failed for ${negocioId}:`, error);
    }
};

/**
 * INVENTARIO SERVICE (FIRESTORE)
 */
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
        const batch = []; // In a real app we'd use writeBatch
        
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

/**
 * CAJA SERVICE (FIRESTORE)
 */
export const cajaService = {
    getCajaStatus: async (negocioId) => {
        // Get current open session
        const q = query(collection(db, 'negocios', negocioId, 'caja_sesiones'), where('status', '==', 'open'), limit(1));
        const snap = await getDocs(q);
        const session = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };

        // Get today's movements
        const today = new Date().toISOString().split('T')[0];
        const movQ = query(collection(db, 'negocios', negocioId, 'caja_movements'), where('fecha', '==', today));
        const movSnap = await getDocs(movQ);
        const movements = movSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        return { session, movements };
    },

    addMovement: async (negocioId, data) => {
        const id = `mov-${Date.now()}`;
        const payload = {
            ...data,
            id,
            negocioId,
            timestamp: serverTimestamp(),
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

/**
 * RESERVAS SERVICE (FIRESTORE)
 */
export const reservasService = {
    fetchReservas: (negocioId, callback) => {
        const q = query(collection(db, 'negocios', negocioId, 'reservas'), orderBy('timestamp', 'desc'), limit(50));
        return onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(list);
        });
    },

    submitReserva: async (negocioId, data) => {
        const id = `res-${Date.now()}`;
        await setDoc(doc(db, 'negocios', negocioId, 'reservas', id), {
            ...data,
            id,
            negocioId,
            timestamp: serverTimestamp(),
            status: 'confirmada'
        });
        return { success: true };
    }
};
