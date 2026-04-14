const mongoose = require("mongoose");

/**
 * Sale Schema for tracking transactions and daily cash (caja).
 */
const SaleSchema = new mongoose.Schema({
    negocioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Negocio",
        required: true
    },
    total: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

module.exports = mongoose.model("Sale", SaleSchema);
