const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const logger = require('./src/utils/logger');
const { errorHandler } = require('./src/middlewares/errorHandler');

dotenv.config();

console.log("🚀 [SISTEMA] Iniciando servidor Complejo Giovanni SaaS...");

// ELIMINACIÓN DE MODO DEMO: firebase.js matará el proceso si no hay credenciales
require('./src/utils/firebase');

const app = express();
const PORT = process.env.PORT || 4000;

// HARDENING: Security Middlewares
app.use(helmet()); 
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Negocio-ID', 'X-User-Role'],
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' }
});
app.use('/api/', limiter);

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10kb' }));

// 🚀 RUTAS DEL SISTEMA POS (CLIENTES)
const pedidosRoutes = require('./src/routes/pedidosRoutes');
const cajaRoutes = require('./src/routes/cajaRoutes');
const inventarioRoutes = require('./src/routes/inventarioRoutes');

app.use('/api/pedidos', pedidosRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/inventario', inventarioRoutes);

// 👑 RUTAS SAAS (DUEÑO DE LA PLATAFORMA / BACKOFFICE)
const saasRoutes = require('./src/routes/saasRoutes');
app.use('/api/saas', saasRoutes);

// Meta / Health
app.get('/health', (req, res) => {
    res.json({ success: true, status: 'Complejo Giovanni SaaS Online', timestamp: new Date() });
});

// SERVIR FRONTEND EN PRODUCCIÓN
const path = require('path');
// Servir archivos estáticos de la carpeta dist (que genera vite)
app.use(express.static(path.join(__dirname, '../dist')));

// Ruta comodín para manejar SPA (React Router)
app.get('*', (req, res) => {
    // Si no es una ruta de API, servimos el index.html del frontend
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    }
});

// Final Middleware: Manejo de Errores Global
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`🚀 [SaaS ENGINE] Motor comercial corriendo en el puerto ${PORT}`);
});
