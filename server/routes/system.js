const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { getSystemStatus } = require("../controllers/systemController");

// Protected route: require authentication to view internal system metrics
router.get("/status", authMiddleware, getSystemStatus);

module.exports = router;
