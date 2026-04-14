const mongoose = require("mongoose");

/**
 * Reservation schema for court bookings, separated by business.
 */
const ReservationSchema = new mongoose.Schema({
    negocioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Negocio",
        required: true
    },
    cancha: { type: String, required: true },
    cliente: { type: String, required: true },
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    estado: { type: String, default: "pendiente" }
}, { timestamps: true });

module.exports = mongoose.model("Reservation", ReservationSchema);
