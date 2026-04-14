const ErrorLog = require("../models/ErrorLog");

/**
 * Persists unhandled errors or explicitly captured errors into MongoDB.
 * 
 * @param {Error} error - The generic JS Error object thrown
 * @param {Object} req - The Express request object to extract context
 */
async function logError(error, req) {
    try {
        await ErrorLog.create({
            mensaje: error.message || "Error desconocido",
            stack: error.stack || null,
            ruta: req ? req.originalUrl : "Background Task / Unknown",
            usuario: req && req.user ? (req.user.email || req.user.id) : "anonimo"
        });
    } catch (e) {
        // Fallback console log to avoid recursive crash if DB is down when logging an error
        console.error("[Error Service] Falla crítica guardando log de error:", e);
    }
}

module.exports = logError;
