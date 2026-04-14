const { db, admin } = require('../utils/firebase');
const { FieldValue } = admin.firestore;
const { orderSchema } = require('../utils/validators');
const { validateStatusTransition, logOperativo } = require('../utils/audit');
const logger = require('../utils/logger');

/**
 * Controller for Orders/Pedidos.
 * HARDENING v4.5: History migration and Dashboard aggregations.
 */

const createPedido = async (req, res, next) => {
    const { negocioId, user } = req;
    
    try {
        const validatedBody = orderSchema.parse(req.body);
        const { items, type, mesa, cliente, metodo_pago, status } = validatedBody;

        const result = await db.runTransaction(async (transaction) => {
            let realTotal = 0;
            const itemDetails = [];

            // 1. Validate Prices and Stock
            for (const item of items) {
                const productRef = db.doc(`negocios/${negocioId}/inventario/${item.id}`);
                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists) throw new Error(`Producto no encontrado: ${item.id}`);
                const productData = productDoc.data();

                realTotal += productData.precio * item.cantidad;

                if (productData.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para: ${productData.nombre}`);
                }

                itemDetails.push({
                    id: item.id,
                    nombre: productData.nombre,
                    precio: productData.precio,
                    cantidad: item.cantidad,
                    subtotal: productData.precio * item.cantidad
                });

                // DEDUCT STOCK
                transaction.update(productRef, {
                    stock: FieldValue.increment(-item.cantidad),
                    updatedAt: FieldValue.serverTimestamp()
                });
            }

            // 2. CREATE ORDER (In Active Orders collection)
            const orderId = `ord-${Date.now()}`;
            const orderRef = db.doc(`negocios/${negocioId}/pedidos/${orderId}`);
            const orderPayload = {
                id: orderId,
                negocioId,
                items: itemDetails,
                total: realTotal,
                type,
                mesa: mesa || 'S/N',
                cliente: cliente || 'Consumidor Final',
                metodo_pago: metodo_pago || 'efectivo',
                status: status || 'nuevo',
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                timestamp: FieldValue.serverTimestamp(),
                createdBy: user?.uid || 'REST_API'
            };
            transaction.set(orderRef, orderPayload);

            // Audit
            await logOperativo({
                usuario: user?.uid,
                accion: 'CREACIÓN_PEDIDO',
                pedidoId: orderId,
                negocioId,
                metadata: { total: realTotal }
            });

            return { orderId, total: realTotal };
        });

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const updateOrder = async (req, res, next) => {
    const { negocioId, user } = req;
    const { id } = req.params;
    const { status, items, mesa } = req.body;

    try {
        const result = await db.runTransaction(async (transaction) => {
            const orderRef = db.doc(`negocios/${negocioId}/pedidos/${id}`);
            const orderDoc = await transaction.get(orderRef);

            if (!orderDoc.exists) throw new Error("Pedido no encontrado en activos.");
            const orderData = orderDoc.data();

            // STATE MACHINE VALIDATION
            if (status) validateStatusTransition(orderData.status, status);

            // AUTO-ARCHIVING (Migration to History)
            if (status === 'pagado' || status === 'finalizado') {
                const historyRef = db.doc(`negocios/${negocioId}/pedidos_historial/${id}`);
                
                // Mover a historial con metadata adicional
                transaction.set(historyRef, {
                    ...orderData,
                    status: 'paid',
                    closedAt: FieldValue.serverTimestamp(),
                    closedBy: user?.uid,
                    archived: true
                });

                // Borrar de activos para mantener rendimiento y reducir costos de query
                transaction.delete(orderRef);

                // REGISTRAR EN CAJA Automáticamente
                const cajaSnap = await transaction.get(
                    db.collection(`negocios/${negocioId}/caja_sesiones`).where('status', '==', 'open').limit(1)
                );

                if (!cajaSnap.empty) {
                    const sessionId = cajaSnap.docs[0].id;
                    const movId = `mov-vent-${Date.now()}`;
                    transaction.set(db.doc(`negocios/${negocioId}/caja_movements/${movId}`), {
                        id: movId,
                        session_id: sessionId,
                        tipo: 'entrada',
                        monto: Number(orderData.total),
                        categoria: 'Venta Bar',
                        descripcion: `Venta Pedido #${id.slice(-4)}`,
                        metodo_pago: orderData.metodo_pago || 'efectivo',
                        timestamp: FieldValue.serverTimestamp(),
                        fecha: new Date().toISOString().split('T')[0]
                    });
                }

                await logOperativo({
                    usuario: user?.uid,
                    accion: 'ARCHIVO_PEDIDO_HISTORIAL',
                    pedidoId: id,
                    negocioId
                });

                return { id, archived: true, status: 'paid' };
            }

            // Normal update if not archiving
            const updates = { 
                updatedAt: FieldValue.serverTimestamp(),
                lastModifiedBy: user?.uid 
            };
            if (status) updates.status = status;
            if (mesa) updates.mesa = mesa;
            if (items) updates.items = items;

            transaction.update(orderRef, updates);

            await logOperativo({
                usuario: user?.uid,
                accion: `MODIFICACIÓN_PEDIDO: ${status || 'info'}`,
                pedidoId: id,
                negocioId
            });

            return { id, status: status || orderData.status };
        });

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getDashboardStats = async (req, res, next) => {
    const { negocioId } = req;
    const today = new Date().toISOString().split('T')[0];

    try {
        // Consultar Historial de hoy (Optimizado por fecha)
        const snap = await db.collection(`negocios/${negocioId}/pedidos_historial`)
            .where('fecha', '==', today)
            .get();

        let totalVentas = 0;
        let count = 0;
        const topProducts = {};

        snap.forEach(doc => {
            const data = doc.data();
            totalVentas += Number(data.total);
            count++;

            data.items?.forEach(item => {
                topProducts[item.nombre] = (topProducts[item.nombre] || 0) + item.cantidad;
            });
        });

        res.json({
            success: true,
            data: {
                hoy: {
                    ventasTotales: totalVentas,
                    pedidosTotales: count,
                    ticketPromedio: count > 0 ? (totalVentas / count) : 0,
                    topProducts: Object.entries(topProducts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const getPedidos = async (req, res, next) => {
    const { negocioId } = req;
    const { limitCount = 50, archive = false } = req.query;

    try {
        const collectionName = archive ? 'pedidos_historial' : 'pedidos';
        const snap = await db.collection(`negocios/${negocioId}/${collectionName}`)
            .orderBy('timestamp', 'desc')
            .limit(Number(limitCount))
            .get();

        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ success: true, data: list });
    } catch (error) {
        next(error);
    }
};

module.exports = { createPedido, getPedidos, updateOrder, getDashboardStats };
