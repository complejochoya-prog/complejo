const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const isSuperAdmin = require("../middleware/isSuperAdmin");
const AuditLog = require("../models/AuditLog");

// Get audit logs for the current business
// Protected by authMiddleware (so req.negocioId is available)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const logs = await AuditLog.find({ negocioId: req.negocioId })
            .sort({ fecha: -1 })
            .limit(100); // Limit to last 100 entries for performance

        res.json(logs);
    } catch (error) {
        console.error("[Audit API] Error fetching logs:", error);
        res.status(500).json({ message: "Error al obtener historial de auditoría." });
    }
});

module.exports = router;
