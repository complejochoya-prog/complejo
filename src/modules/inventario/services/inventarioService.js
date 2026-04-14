import { inventarioService, cajaService } from '../../../core/services/firestoreService.js';

/**
 * ADAPTADOR PARA INVENTARIO SERVICE
 * Mantiene la firma de funciones original pero usa Firestore.
 */
export const fetchProductos = async (negocioId, filters = {}) => {
    return inventarioService.getProductos(negocioId, filters);
};

export const fetchProducto = async (negocioId, id) => {
    const prods = await inventarioService.getProductos(negocioId);
    return prods.find(p => p.id === id) || null;
};

export const saveProducto = async (negocioId, data) => {
    return inventarioService.saveProducto(negocioId, data);
};

export const deleteProducto = async (negocioId, id) => {
    return inventarioService.deleteProducto(negocioId, id);
};

export const registrarMovimiento = async (negocioId, mov) => {
    return inventarioService.registrarMovimiento(negocioId, mov);
};

export const fetchMovimientos = async (negocioId, productoId = null) => {
    // Basic implementation for history
    const { getDocs, collection, query, where, db } = await import('firebase/firestore');
    const ref = collection(db, 'negocios', negocioId, 'inventario_movimientos');
    let q = query(ref);
    if (productoId) q = query(ref, where('productoId', '==', productoId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getInventarioStats = async (negocioId) => {
    const list = await fetchProductos(negocioId);
    return {
        total_productos: list.length,
        valor_total: list.reduce((a, b) => a + (Number(b.precio || 0) * Number(b.stock || 0)), 0),
        alertas: list.filter(p => Number(p.stock) <= Number(p.stock_minimo || 0)).length
    };
};

export const registrarVentaBar = async (negocioId, items, ventaId) => {
    for (const item of items) {
        await registrarMovimiento(negocioId, {
            productoId: item.id,
            tipo: 'Venta',
            cantidad: item.cantidad || item.quantity || 1,
            origen: 'Venta Bar',
            usuario: 'Sistema',
            refId: ventaId
        });
    }
    return { success: true };
};

/**
 * ADAPTADOR PARA CAJA SERVICE
 */
export const fetchCajaStatus = async (negocioId) => {
    const { session, movements } = await cajaService.getCajaStatus(negocioId);
    
    const entradas = movements.filter(m => m.tipo === 'entrada');
    const salidas = movements.filter(m => m.tipo === 'salida');
    const ingresosHoy = entradas.reduce((a, b) => a + Number(b.monto), 0);
    const egresosHoy = salidas.reduce((a, b) => a + Number(b.monto), 0);

    return {
        session,
        stats: {
            totalBalance: session ? (Number(session.initialAmount || session.initialBalance || 0) + ingresosHoy - egresosHoy) : 0,
            ingresosHoy,
            egresosHoy,
            gananciaHoy: ingresosHoy - egresosHoy
        },
        movements
    };
};

export const addMovement = async (negocioId, data) => cajaService.addMovement(negocioId, data);
export const openCaja = async (negocioId, balance, user) => cajaService.openCaja(negocioId, balance, user);
export const registerExternalMovement = async (negocioId, data) => cajaService.addMovement(negocioId, data);
