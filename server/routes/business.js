const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createBusiness, getBusinesses } = require("../controllers/businessController");

router.post("/", authMiddleware, createBusiness);
router.get("/", authMiddleware, getBusinesses);

module.exports = router;
