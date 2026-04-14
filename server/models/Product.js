const mongoose = require("mongoose");

/**
 * Product Schema for the Bar menu.
 * Tracks pricing and current inventory levels.
 */
const ProductSchema = new mongoose.Schema({
    negocioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Negocio",
        required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    category: { type: String, default: "bar" }
}, { timestamps: true });

ProductSchema.index({ negocioId: 1 });

module.exports = mongoose.model("Product", ProductSchema);
