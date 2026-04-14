const { db, admin } = require('../utils/firebase');
const { FieldValue } = admin.firestore;
const logger = require('../utils/logger');

/**
 * CAJA CONTROLLER v4.5 (POCKET PRO)
 * Implementa apertura, movimientos, cierre y validación de turnos.
 */

const getCajaStatus = async (req, res, next) => {
    const { negocioId } = req;
    try {
        // 1. Sesión Activa (Abierta)
        const sessionSnap = await db.collection(`negocios/${negocioId}/caja_sesiones`)
            .where('status', '==', 'open')
            .limit(1)
            .get();

        const session = sessionSnap.empty ? null : { id: sessionSnap.docs[0].id, ...sessionSnap.docs[0].data() };

        // 2. Movimientos del Turno Actual (Si hay uno abierto)
        let movements = [];
        if (session) {
            const movSnap = await db.collection(`negocios/${negocioId}/caja_movements`)
                .where('session_id', '==', session.id)
                .orderBy('timestamp', 'desc')
                .get();
            movements = movSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        res.json({ success: true, data: { session, movements } });
    } catch (error) {
        next(error);
    }
};

const openCaja = async (req, res, next) => {
    const { negocioId, user } = req;
    const { initialBalance } = req.body;

    try {
        const id = `ses-${Date.now()}`;
        
        await db.runTransaction(async (transaction) => {
            // Validar que no haya otra abierta
            const openSnap = await transaction.get(
                db.collection(`negocios/${negocioId}/caja_sesiones`).where('status', '==', 'open').limit(1)
            );

            if (!openSnap.empty) throw new Error("Ya existe una caja abierta para este negocio.");

            const sessionRef = db.doc(`negocios/${negocioId}/caja_sesiones/${id}`);
            transaction.set(sessionRef, {
                id,
                negocioId,
                status: 'open',
                openedAt: FieldValue.serverTimestamp(),
                openedBy: user?.uid || 'admin',
                initialBalance: Number(initialBalance || 0),
                currentBalance: Number(initialBalance || 0)
            });
        });

        res.json({ success: true, data: { id, initialBalance } });
    } catch (error) {
        next(error);
    }
};

const closeCaja = async (req, res, next) => {
    const { negocioId, user } = req;
    const { sessionId, finalAmountReal } = req.body;

    try {
        await db.runTransaction(async (transaction) => {
            const sessionRef = db.doc(`negocios/${negocioId}/caja_sesiones/${sessionId}`);
            const sessionDoc = await transaction.get(sessionRef);

            if (!sessionDoc.exists) throw new Error("Sesión de caja no encontrada.");
            const sessionData = sessionDoc.data();

            // Calcular Balance Final Teórico vs Real
            const movSnap = await transaction.get(
                db.collection(`negocios/${negocioId}/caja_movements`).where('session_id', '==', sessionId)
            );

            let income = 0;
            let outcome = 0;
            movSnap.forEach(m => {
                const d = m.data();
                if (d.tipo === 'entrada') income += Number(d.monto);
                else outcome += Number(d.monto);
            });

            const totalSystem = Number(sessionData.initialBalance) + income - outcome;
            const difference = Number(finalAmountReal) - totalSystem;

            transaction.update(sessionRef, {
                status: 'closed',
                closedAt: FieldValue.serverTimestamp(),
                closedBy: user?.uid,
                totalSystem,
                totalReal: Number(finalAmountReal),
                difference,
                income,
                outcome
            });

            // LOG Audit
            const logRef = db.doc(`negocios/${negocioId}/logs_operativos/${Date.now()}`);
            transaction.set(logRef, {
                accion: 'CIERRE_CAJA',
                usuario: user?.uid,
                metadata: { sessionId, difference },
                timestamp: FieldValue.serverTimestamp()
            });
        });

        res.json({ success: true, message: "Caja cerrada correctamente" });
    } catch (error) {
        next(error);
    }
};

const createMovement = async (req, res, next) => {
    const { negocioId, user } = req;
    const { tipo, monto, categoria, descripcion, metodo_pago } = req.body;

    try {
        const id = `mov-${Date.now()}`;
        
        const result = await db.runTransaction(async (transaction) => {
            // 1. Buscar sesión abierta
            const openSnap = await transaction.get(
                db.collection(`negocios/${negocioId}/caja_sesiones`).where('status', '==', 'open').limit(1)
            );

            if (openSnap.empty) throw new Error("Debe abrir la caja antes de registrar movimientos.");
            const session = openSnap.docs[0];

            const movRef = db.doc(`negocios/${negocioId}/caja_movements/${id}`);
            transaction.set(movRef, {
                id,
                negocioId,
                session_id: session.id,
                tipo,
                monto: Number(monto),
                categoria,
                descripcion: descripcion || '',
                metodo_pago: metodo_pago || 'efectivo',
                timestamp: FieldValue.serverTimestamp(),
                fecha: new Date().toISOString().split('T')[0]
            });

            return { id };
        });

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCajaStatus, openCaja, closeCaja, createMovement };
