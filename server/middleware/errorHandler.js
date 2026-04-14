const logError = require("../services/errorService");

/**
 * Global Error Handling Middleware for Express.
 * This MUST be registered after all other routes and middlewares.
 */
module.exports = async function(err, req, res, next) {
    console.error(`[Global Error Handler] Capturado error en ${req.originalUrl}:`, err.message);
    
    // Save to the database
    await logError(err, req);

    // Send a safe generic payload to the client so the app doesn't crash or leak stack info
    res.status(500).json({
        error: "Error interno del servidor",
        message: "El equipo técnico ha sido notificado del problema automáticamente."
    });
};
