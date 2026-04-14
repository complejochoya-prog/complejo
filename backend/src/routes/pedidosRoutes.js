const express = require('express');
const router = express.Router();
const { getPedidos, createPedido, updateOrder, getDashboardStats } = require('../controllers/pedidosController');
const { verifyAuthToken, optionalAuth } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/roleCheck');
const { validateSubscription } = require('../utils/saas');

// GET Dashboard (Analytics Avanzado - Solo Premium/Pro)
router.get('/stats', verifyAuthToken, validateSubscription, checkRole(['admin']), (req, res, next) => {
    // HARDENING: Gating de Funcionalidad Pro/Premium
    if (req.planConfig && !req.planConfig.features.includes('analytics_avanzado')) {
        return res.status(403).json({ 
            success: false, 
            error: "Tu plan actual no incluye métricas avanzadas. Por favor, actualiza a Pro o Premium.",
            code: "FEATURE_LOCKED"
        });
    }
    next();
}, getDashboardStats);

// Rutas Estándar con Validación de Suscripción (Multi-Tenant)
router.get('/', verifyAuthToken, validateSubscription, getPedidos);
router.post('/', optionalAuth, validateSubscription, createPedido);
router.put('/:id', verifyAuthToken, validateSubscription, checkRole(['admin', 'mozo', 'cocina']), updateOrder);

module.exports = router;
