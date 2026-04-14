const mongoose = require("mongoose");

const NegocioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    direccion: String,
    telefono: String,
    propietario: String,
    plan: {
        type: String,
        default: "basic"
    },
    fechaPago: Date,
    vencimiento: Date,
    activo: {
        type: Boolean,
        default: true
    },
    creado: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String, // Contact email for automated reports
        default: ""
    }
});

module.exports = mongoose.model("Negocio", NegocioSchema);
