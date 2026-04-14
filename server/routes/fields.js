const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getFields, createField, updateField } = require("../controllers/fieldsController");

/**
 * API Routes for court (field) management.
 */
const checkSubscription = require("../middleware/checkSubscription");

router.get("/", authMiddleware, checkSubscription, getFields);
router.post("/", authMiddleware, checkSubscription, createField);
router.put("/:id", authMiddleware, checkSubscription, updateField);

module.exports = router;
