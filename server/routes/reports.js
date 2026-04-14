const express = require("express");
const router = express.Router();
const { getReportsData } = require("../controllers/reportsController");
const authMiddleware = require("../middleware/authMiddleware");
const checkSubscription = require("../middleware/checkSubscription");

/**
 * Route to fetch aggregated business reports data.
 */
router.get("/", authMiddleware, checkSubscription, getReportsData);

module.exports = router;
