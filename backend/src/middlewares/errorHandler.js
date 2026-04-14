const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.name}: ${err.message} | ${req.method} ${req.url} | ${req.ip}`);

    // Zod validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            error: "Error de validación de datos",
            details: err.flatten().fieldErrors,
            code: "VALIDATION_ERROR"
        });
    }

    // Default 500
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Ocurrió un error interno en el servidor';

    res.status(statusCode).json({
        success: false,
        error: message,
        code: err.code || "INTERNAL_SERVER_ERROR"
    });
};

module.exports = { errorHandler };
