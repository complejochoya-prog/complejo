const { db, admin } = require('./firebase');
const logger = require('./logger');

/**
 * PLAN CONFIGURATION v5.0
 * Define los límites y funcionalidades por cada nivel de suscripción.
 */
const SAAS_PLANS = {
    'BASIC': {
        name: 'Plan Básico',
        userLimit: 2,
        features: ['pedidos', 'inventario'],
        price: 15000
    },
    'PRO': {
        name: 'Plan Pro',
        userLimit: 5,
        features: ['pedidos', 'inventario', 'caja', 'reservas'],
        price: 35000
    },
    'PREMIUM': {
        name: 'Plan Premium',
        userLimit: 999,
        features: ['pedidos', 'inventario', 'caja', 'reservas', 'metodopago_MP', 'analytics_avanzado'],
        price: 60000
    }
};

/**
 * MIDDLEWARE: VALIDATE SUBSCRIPTION
 * Bloquea el acceso si el negocio está suspendido o el plan no permite la acción.
 */
const validateSubscription = async (req, res, next) => {
    const { negocioId } = req;
    
    if (!negocioId) return next();

    try {
        const subDoc = await db.doc(`saas_clientes/${negocioId}`).get();
        
        if (!subDoc.exists) {
            // Permitir 'giovanni' como demo principal si no existe doc
            if (negocioId === 'giovanni') return next();
            return res.status(403).json({ success: false, error: "Negocio no registrado en la plataforma SaaS.", code: "BUSINESS_NOT_FOUND" });
        }

        const subData = subDoc.data();
        const now = new Date();

        // 1. Verificar Estado
        if (subData.estado === 'suspendido') {
            return res.status(403).json({ 
                success: false, 
                error: "Suscripción suspendida. Contacte a soporte.", 
                code: "SUBSCRIPTION_SUSPENDED" 
            });
        }

        // 2. Verificar Vencimiento
        if (subData.fecha_vencimiento && subData.fecha_vencimiento.toDate() < now) {
            // Auto-suspender localmente en la respuesta (el cron o webhook haría el cambio real en DB)
            return res.status(403).json({ 
                success: false, 
                error: "Suscripción vencida. Por favor, realice su pago.", 
                code: "SUBSCRIPTION_EXPIRED" 
            });
        }

        // Inyectar plan en el request para uso posterior
        req.subscription = subData;
        req.planConfig = SAAS_PLANS[subData.plan] || SAAS_PLANS['BASIC'];

        next();
    } catch (error) {
        logger.error(`Error de validación SaaS: ${error.message}`);
        next(error);
    }
};

module.exports = { SAAS_PLANS, validateSubscription };
