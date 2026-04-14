const mongoose = require("mongoose");

/**
 * User schema for multi-tenant SaaS.
 * Each user is linked to a specific business (negocioId).
 */
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    negocioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Negocio",
        required: true
    },
    fcmToken: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
