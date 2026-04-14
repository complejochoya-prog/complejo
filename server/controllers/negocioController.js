const Negocio = require("../models/Negocio");

exports.createNegocio = async (req, res) => {
    try {
        const negocio = new Negocio(req.body);
        await negocio.save();
        res.status(201).json(negocio);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el negocio", error: error.message });
    }
};
