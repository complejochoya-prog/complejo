const mongoose = require("mongoose");

const AuditSchema = new mongoose.Schema({
    usuario: {
        type: String, // email or name of the user who performed the action
        required: true
    },
    accion: {
        type: String, // e.g., "crear_producto", "actualizar_reserva"
        required: true
    },
    modulo: {
        type: String, // e.g., "inventario", "reservas"
        required: true
    },
    negocioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Negocio",
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    detalle: {
        type: String // Extra contextual information
    }
});

// Index to quickly fetch logs by business or date
AuditSchema.index({ negocioId: 1, fecha: -1 });

module.exports = mongoose.model("AuditLog", AuditSchema);
