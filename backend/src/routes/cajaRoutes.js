const express = require('express');
const router = express.Router();
const { getCajaStatus, openCaja, closeCaja, createMovement } = require('../controllers/cajaController');
const { verifyAuthToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/roleCheck');

// GET Caja: Solo admin/caja pueden ver status
router.get('/', verifyAuthToken, checkRole(['admin', 'caja']), getCajaStatus);

// POST Abrir: Iniciar turno (Admin)
router.post('/abrir', verifyAuthToken, checkRole(['admin', 'caja']), openCaja);

// POST Cerrar: Finalizar turno y registrar diferencias
router.post('/cerrar', verifyAuthToken, checkRole(['admin', 'caja']), closeCaja);

// POST Movimiento: Manual (Entrada/Salida)
router.post('/movimiento', verifyAuthToken, checkRole(['admin', 'caja']), createMovement);

module.exports = router;
