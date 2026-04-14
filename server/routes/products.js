const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getProducts, createProduct, updateProduct } = require("../controllers/productsController");

/**
 * API Routes for Bar Products management.
 */
const checkSubscription = require("../middleware/checkSubscription");

router.get("/", authMiddleware, checkSubscription, getProducts);
router.post("/", authMiddleware, checkSubscription, createProduct);
router.put("/:id", authMiddleware, checkSubscription, updateProduct);

module.exports = router;
