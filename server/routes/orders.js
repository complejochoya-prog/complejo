const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getOrders, createOrder, updateOrder } = require("../controllers/ordersController");

/**
 * API Routes for Bar Orders.
 */
const checkSubscription = require("../middleware/checkSubscription");

router.get("/", authMiddleware, checkSubscription, getOrders);
router.post("/", authMiddleware, checkSubscription, createOrder);
router.put("/:id", authMiddleware, checkSubscription, updateOrder);

module.exports = router;
