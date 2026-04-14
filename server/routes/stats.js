const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getStats } = require("../controllers/statsController");

/**
 * API Routes for Business Statistics.
 */
const checkSubscription = require("../middleware/checkSubscription");

router.get("/", authMiddleware, checkSubscription, getStats);

module.exports = router;
