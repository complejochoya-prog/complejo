const Negocio = require("../models/Negocio");

exports.updatePlan = async (req, res) => {
    try {
        const { plan } = req.body;
        const negocio = await Negocio.findById(req.params.id);

        if (!negocio) {
            return res.status(404).json({ message: "Negocio no encontrado" });
        }

        negocio.plan = plan;
        const hoy = new Date();
        negocio.fechaPago = hoy;
        
        // Extension logic: +1 month
        const vencimiento = new Date(hoy);
        vencimiento.setMonth(vencimiento.getMonth() + 1);
        negocio.vencimiento = vencimiento;
        
        negocio.activo = true;
        await negocio.save();

        res.json(negocio);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el plan", error: error.message });
    }
};
