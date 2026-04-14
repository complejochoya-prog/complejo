const admin = require("firebase-admin")
const path = require("path");
const fs = require("fs");

let app;

function initFirebase() {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      console.log("🔥 [FIREBASE] Usando credenciales por variables de ENTORNO");

      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        })
      })
    } else {
      console.log("📁 [FIREBASE] Intentando cargar serviceAccountKey.json");

      // Buscamos el archivo en la raíz del backend (fuera de src)
      const keyPath = path.join(__dirname, "../../serviceAccountKey.json");
      
      if (!fs.existsSync(keyPath)) {
        throw new Error(`Archivo no encontrado en la ruta: ${keyPath}`);
      }

      const serviceAccount = require(keyPath);

      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
    }

    console.log("✅ [FIREBASE] Admin SDK inicializado correctamente");
    return admin.firestore();

  } catch (error) {
    console.error("❌ [FIREBASE] ERROR CRÍTICO:", error.message);

    const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
    if (isDev) {
      console.log("⚠️ [MOCK] MODO MOCK ACTIVADO (solo desarrollo)");

      return {
        collection: (col) => ({
          get: async () => ({ docs: [], empty: true, forEach: () => {} }),
          doc: () => ({
            get: async () => ({ exists: false, data: () => ({}) }),
            set: async () => {},
            update: async () => {},
            delete: async () => {}
          }),
          where: function() { return this; },
          limit: function() { return this; },
          orderBy: function() { return this; }
        }),
        doc: () => ({
          get: async () => ({ exists: false, data: () => ({}) }),
          set: async () => {},
          update: async () => {}
        }),
        runTransaction: async (cb) => { return {}; }
      };
    }

    console.error("🚨 [SISTEMA] No se puede iniciar el servidor sin Firebase en modo producción.");
    process.exit(1);
  }
}

const db = initFirebase();

module.exports = db;
