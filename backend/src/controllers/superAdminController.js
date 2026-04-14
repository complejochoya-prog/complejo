const { db, admin } = require('../utils/firebase');
const { FieldValue } = admin.firestore;
const logger = require('../utils/logger');

/**
 * SUPERADMIN CONTROLLER v5.0 (SYSTEM OWNER)
 * Gestiona el negocio de los negocios.
 */

const getGlobalDashboard = async (req, res, next) => {
    try {
        const clientsSnap = await db.collection('saas_clientes').get();
        let totalRevenue = 0;
        let activeClients = 0;
        let expiredClients = 0;
        const plansStats = { 'BASIC': 0, 'PRO': 0, 'PREMIUM': 0 };

        clientsSnap.forEach(doc => {
            const data = doc.data();
            if (data.estado === 'activo') activeClients++;
            if (data.estado === 'suspendido') expiredClients++;
            
            plansStats[data.plan] = (plansStats[data.plan] || 0) + 1;
            
            // Ingresos estimados (ejemplo basado en precios del plan)
            const prices = { 'BASIC': 15000, 'PRO': 35000, 'PREMIUM': 60000 };
            totalRevenue += prices[data.plan] || 0;
        });

        res.json({
            success: true,
            data: {
                totalClients: clientsSnap.size,
                activeClients,
                expiredClients,
                estimatedMonthlyRevenue: totalRevenue,
                plansBreakdown: plansStats,
                timestamp: new Date()
            }
        });
    } catch (e) {
        next(e);
    }
};

const createClient = async (req, res, next) => {
    const { negocioId, nombre_negocio, plan, duenoEmail } = req.body;
    
    try {
        const id = negocioId || `neg-${Date.now()}`;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 días iniciales
        
        const clientPayload = {
            id,
            negocioId: id,
            nombre_negocio,
            duenoEmail,
            plan: plan || 'BASIC',
            estado: 'activo',
            fecha_inicio: FieldValue.serverTimestamp(),
            fecha_vencimiento: admin.firestore.Timestamp.fromDate(expiryDate),
            montoTotalPagado: 0,
            creadoEn: FieldValue.serverTimestamp()
        };

        await db.collection('saas_clientes').doc(id).set(clientPayload);
        
        // Inicializar carpeta vacía de configuración para el negocio
        await db.collection(`negocios/${id}/configuracion`).doc('general').set({
            nombre: nombre_negocio,
            plan: plan || 'BASIC',
            activeModules: ['pedidos', 'inventario']
        });

        res.json({ success: true, data: clientPayload });
    } catch (e) {
        next(e);
    }
};

const updateClientStatus = async (req, res, next) => {
    const { id } = req.params;
    const { estado, plan, mesesExtra } = req.body;

    try {
        const clientRef = db.doc(`saas_clientes/${id}`);
        const snap = await clientRef.get();
        if (!snap.exists) throw new Error("Cliente no existe");

        const updates = {};
        if (estado) updates.estado = estado;
        if (plan) updates.plan = plan;
        
        if (mesesExtra) {
            const currentExpiry = snap.data().fecha_vencimiento.toDate();
            currentExpiry.setMonth(currentExpiry.getMonth() + Number(mesesExtra));
            updates.fecha_vencimiento = admin.firestore.Timestamp.fromDate(currentExpiry);
        }

        await clientRef.update(updates);
        res.json({ success: true, message: `Cliente ${id} actualizado correclamente.` });
    } catch (e) {
        next(e);
    }
};

module.exports = { getGlobalDashboard, createClient, updateClientStatus };
