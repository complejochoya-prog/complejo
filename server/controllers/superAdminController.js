const Negocio = require("../models/Negocio");

exports.getNegocios = async (req, res) => {
    try {
        const negocios = await Negocio.find();
        res.json(negocios);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener negocios", error: error.message });
    }
};

exports.toggleNegocio = async (req, res) => {
    try {
        const negocio = await Negocio.findById(req.params.id);
        if (!negocio) {
            return res.status(404).json({ message: "Negocio no encontrado" });
        }
        negocio.activo = !negocio.activo;
        await negocio.save();
        res.json(negocio);
    } catch (error) {
        res.status(500).json({ message: "Error al cambiar estado del negocio", error: error.message });
    }
};

exports.createNegocio = async (req, res) => {
    try {
        const nuevoNegocio = new Negocio(req.body);
        await nuevoNegocio.save();
        res.status(201).json(nuevoNegocio);
    } catch (error) {
        res.status(400).json({ message: "Error al crear negocio", error: error.message });
    }
};

exports.updateNegocio = async (req, res) => {
    try {
        const negocio = await Negocio.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!negocio) {
            return res.status(404).json({ message: "Negocio no encontrado" });
        }
        res.json(negocio);
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar negocio", error: error.message });
    }
};
