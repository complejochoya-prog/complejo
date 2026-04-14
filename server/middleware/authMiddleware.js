const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "SISTEMA_SECRET";

/**
 * Middleware to verify JWT tokens and inject user data into the request.
 */
module.exports = function(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        req.negocioId = decoded.negocioId;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token inválido o expirado" });
    }
};
