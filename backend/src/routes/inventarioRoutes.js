const express = require('express');
const router = express.Router();
const { getInventario, updateStock } = require('../controllers/inventarioController');
const { verifyAuthToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/roleCheck');

// GET Inventario: Cualquier empleado puede ver stock
router.get('/', verifyAuthToken, getInventario);

// PUT Stock: Solo admin y cocineros autorizados
router.put('/:id', verifyAuthToken, checkRole(['admin', 'cocina', 'cocinero']), updateStock);

module.exports = router;
