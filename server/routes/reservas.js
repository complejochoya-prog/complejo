const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getReservas, crearReserva, crearPagoReserva } = require("../controllers/reservasController");

/**
 * API Routes for court reservations.
 * Protected by JWT authentication for management, public for payments.
 */
const checkSubscription = require("../middleware/checkSubscription");

router.get("/", authMiddleware, checkSubscription, getReservas);
router.post("/", authMiddleware, checkSubscription, crearReserva);
router.post("/pago", crearPagoReserva); // Public for clients choosing a slot

module.exports = router;
