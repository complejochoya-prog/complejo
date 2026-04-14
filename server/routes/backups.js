const express = require("express");
const router = express.Router();
const { exec } = require("child_process");
const path = require("path");
const { backupFolder } = require("../services/backupService");
const authMiddleware = require("../middleware/authMiddleware");
const isSuperAdmin = require("../middleware/isSuperAdmin");

/**
 * Manually trigger a backup.
 * Restricted to Super Admin.
 */
router.get("/generate", authMiddleware, isSuperAdmin, (req, res) => {
    const fileName = `manual-backup-${Date.now()}.gz`;
    const filePath = path.join(backupFolder, fileName);

    exec(`mongodump --archive="${filePath}" --gzip`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ 
                error: "Error al generar backup manual", 
                message: error.message 
            });
        }
        res.json({ 
            message: "Backup manual generado con éxito", 
            fileName: fileName 
        });
    });
});

module.exports = router;
