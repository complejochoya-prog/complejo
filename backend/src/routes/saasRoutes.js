const express = require('express');
const router = express.Router();
const { getGlobalDashboard, createClient, updateClientStatus } = require('../controllers/superAdminController');
const { getMetrics } = require('../controllers/metricsController');
const { verifyAuthToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/roleCheck');

/**
 * RUTAS SUPERADMIN / SAAS OWNER
 */

// Dashboard Global de Métricas (MRR, Churn, Crecimiento)
router.get('/metrics', verifyAuthToken, checkRole(['superadmin']), getMetrics);

// Dashboard Operativo de Clientes
router.get('/dashboard', verifyAuthToken, checkRole(['superadmin']), getGlobalDashboard);

// Onboarding de Clientes
router.post('/clientes', verifyAuthToken, checkRole(['superadmin']), createClient);

// Gestión de Planes y Estados
router.put('/clientes/:id', verifyAuthToken, checkRole(['superadmin']), updateClientStatus);

module.exports = router;
