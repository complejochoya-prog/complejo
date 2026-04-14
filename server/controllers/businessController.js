const Business = require("../models/Business");

/**
 * Creates a new business linked to the current user (owner).
 */
exports.createBusiness = async (req, res) => {
    try {
        const business = new Business({
            name: req.body.name,
            ownerId: req.user.id
        });

        await business.save();
        res.status(201).json(business);
    } catch (error) {
        res.status(400).json({ message: "Error al crear negocio", error: error.message });
    }
};

/**
 * Retrieves all businesses owned by the current user.
 */
exports.getBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find({ ownerId: req.user.id });
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener negocios", error: error.message });
    }
};
