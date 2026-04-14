const mongoose = require("mongoose");

/**
 * Business schema representing a tenant in the SaaS platform.
 */
const BusinessSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerId: { type: String, required: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Business", BusinessSchema);
