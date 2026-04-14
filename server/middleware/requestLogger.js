const logger = require("../services/logger");

module.exports = function(req, res, next) {
    logger.info({
        metodo: req.method,
        ruta: req.originalUrl,
        ip: req.ip
    });
    
    next();
};
