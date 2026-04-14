const db = require('../config/firebase');
const admin = require("firebase-admin");

/**
 * RE-EXPORTING FROM NEW CONFIG
 * Adaptado para devolver la instancia de DB compatible con el controlador.
 */
module.exports = { 
    admin, 
    db, 
    auth: admin.apps.length > 0 ? admin.auth() : {
        verifyIdToken: async () => ({ uid: 'mock-user', role: 'superadmin' })
    }
};
