const { db, admin } = require('../utils/firebase');
const { FieldValue } = admin.firestore;
const logger = require('../utils/logger');

/**
 * LOG OPERATIVO (BACKEND)
 * Registra cada acción crítica en una colección de auditoría.
 */
const logOperativo = async ({ usuario, accion, pedidoId, negocioId, metadata = {} }) => {
    try {
        const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        await db.collection(`negocios/${negocioId}/logs_operativos`).doc(id).set({
            id,
            usuario: usuario || 'Sistema',
            accion,
            pedidoId: pedidoId || null,
            negocioId,
            timestamp: FieldValue.serverTimestamp(),
            metadata
        });
    } catch (e) {
        logger.error(`Error al registrar log operativo: ${e.message}`);
    }
};

/**
 * VALIDACIÓN DE MÁQUINA DE ESTADOS (HARDENING)
 */
const validateStatusTransition = (current, next) => {
    const rules = {
        'nuevo': ['preparando', 'cancelado'],
        'pendiente': ['preparando', 'cancelado'],
        'preparando': ['listo', 'listo_para_salir', 'cancelado'],
        'listo': ['entregado', 'pagado'],
        'listo_para_salir': ['en_camino', 'entregado'],
        'en_camino': ['entregado', 'pagado'],
        'entregado': ['pagado'],
        'pagado': [], // Final
        'cancelado': [] // Final
    };

    if (current === next) return; // No change is okay (idempotent)
    
    // Bloquear salto directo de nuevo -> listo (Regla Fase 3)
    if ((current === 'nuevo' || current === 'pendiente') && (next === 'listo' || next === 'listo_para_salir')) {
        throw new Error("El pedido debe pasar por preparación antes de marcarse como listo.");
    }

    if (!rules[current] || !rules[current].includes(next)) {
        throw new Error(`Transición inválida: No se puede pasar de '${current}' a '${next}'`);
    }
};

module.exports = { logOperativo, validateStatusTransition };
