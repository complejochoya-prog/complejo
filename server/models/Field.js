const mongoose = require("mongoose");

/**
 * Field schema for court configuration.
 */
const FieldSchema = new mongoose.Schema({
    negocioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Negocio",
        required: true
    },
    name: { type: String, required: true },
    tipo: { type: String, default: "futbol5" },
    precio: { type: Number, default: 0 },
    apertura: { type: String, default: "08:00" },
    cierre: { type: String, default: "00:00" }
}, { timestamps: true });

module.exports = mongoose.model("Field", FieldSchema);
