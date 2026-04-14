const mongoose = require("mongoose");

const ErrorSchema = new mongoose.Schema({
    mensaje: {
        type: String,
        required: true
    },
    stack: {
        type: String
    },
    ruta: {
        type: String
    },
    usuario: {
        type: String, // email or ID if authenticated, "anonimo" if not
        default: "anonimo"
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

// Index to quickly sort errors by date
ErrorSchema.index({ fecha: -1 });

module.exports = mongoose.model("ErrorLog", ErrorSchema);
