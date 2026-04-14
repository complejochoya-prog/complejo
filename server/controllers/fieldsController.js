const Field = require("../models/Field");

/**
 * Controller for managing court configurations.
 */

/**
 * Retrieves all fields for the business.
 */
exports.getFields = async (req, res) => {
    try {
        const fields = await Field.find({ negocioId: req.user.negocioId });
        res.json(fields);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener canchas", error: error.message });
    }
};

/**
 * Creates a new field for the business.
 */
exports.createField = async (req, res) => {
    try {
        const field = new Field({
            ...req.body,
            negocioId: req.user.negocioId
        });
        await field.save();
        res.status(201).json(field);
    } catch (error) {
        res.status(400).json({ message: "Error al crear cancha", error: error.message });
    }
};
