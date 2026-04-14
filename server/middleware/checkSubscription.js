const Negocio = require("../models/Negocio");

module.exports = async function(req, res, next) {
    try {
        const negocio = await Negocio.findById(req.negocioId);

        if (!negocio) {
            return res.status(404).json({ error: "Negocio no encontrado" });
        }

        if (!negocio.activo) {
            return res.status(403).json({
                error: "Suscripción inactiva"
            });
        }

        if (negocio.vencimiento) {
            const hoy = new Date();
            if (hoy > negocio.vencimiento) {
                return res.status(403).json({
                    error: "Suscripción vencida"
                });
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ error: "Error al verificar suscripción", message: error.message });
    }
};
