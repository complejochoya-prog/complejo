import { db } from '../../firebase/config';
import { 
    collection, 
    doc, 
    setDoc, 
    onSnapshot, 
    serverTimestamp,
    query,
    orderBy,
    limit
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

        // 5. Migrate Clientes
        const clientKey = 'giovanni_users_db';
        const legacyClients = JSON.parse(localStorage.getItem(clientKey) || '[]');
        if (legacyClients.length > 0) {
            console.log(`[Migration] Migrating ${legacyClients.length} clients...`);
            for (const c of legacyClients) {
                if (c.negocioId === negocioId) {
                    await setDoc(doc(db, 'negocios', negocioId, 'clientes', c.id), {
                        ...c,
                        createdAt: c.createdAt || serverTimestamp()
                    });
                }
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
