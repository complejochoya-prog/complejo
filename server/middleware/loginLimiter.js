const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per `window`
    message: {
        error: "Demasiados intentos de login fallidos, por favor intenta después de 15 minutos"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = loginLimiter;
