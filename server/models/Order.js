const mongoose = require("mongoose");

/**
 * Order Schema for the Bar system.
 * Tracks orders from tables or courts.
 */
const OrderSchema = new mongoose.Schema({
    negocioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Negocio",
        required: true
    },
    mesa: { type: String, required: true }, // Table or Court name/number
    items: { type: Array, default: [] }, // List of products ordered
    estado: {
        type: String,
        enum: ["pendiente", "preparando", "listo", "entregado"],
        default: "pendiente"
    },
    total: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
