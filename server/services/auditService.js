const AuditLog = require("../models/AuditLog");

/**
 * Logs an action into the database for auditing purposes.
 * 
 * @param {Object} params - Audit log parameters
 * @param {string} params.usuario - The user performing the action (email/name)
 * @param {string} params.accion - A short string describing the action type (e.g. "crear_producto")
 * @param {string} params.modulo - The module where this occurred (e.g. "inventario")
 * @param {string} params.negocioId - The ID of the business
 * @param {string} [params.detalle] - A longer string with specific details about the action
 */
async function logAction({ usuario, accion, modulo, negocioId, detalle }) {
    try {
        await AuditLog.create({
            usuario,
            accion,
            modulo,
            negocioId,
            detalle
        });
    } catch (error) {
        // We log the error in the console but do not throw it, 
        // to prevent an audit failure from blocking a successful user action.
        console.error("[Audit Service] Error registrando auditoría:", error);
    }
}

module.exports = logAction;
