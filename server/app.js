/**
 * Main Backend Server
 * Node.js + Express with MongoDB Integration.
 */
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("mongo-sanitize");
const compression = require("compression"); // Added compression
const connectDB = require("./database/mongo");
const { init } = require("./socket");
const requestLogger = require("./middleware/requestLogger"); // Require logger

// Routes
const authRoutes = require("./routes/auth");
const businessRoutes = require("./routes/business");
const reservasRoutes = require("./routes/reservas");
const fieldsRoutes = require("./routes/fields");
const ordersRoutes = require("./routes/orders");
const productsRoutes = require("./routes/products");
const statsRoutes = require("./routes/stats");
const negociosRoutes = require("./routes/negocios");
const subscriptionRoutes = require("./routes/subscription");
const superAdminRoutes = require("./routes/superadmin");
const backupRoutes = require("./routes/backups");
const reportsRoutes = require("./routes/reports");
const auditRoutes = require("./routes/audit");
const errorRoutes = require("./routes/errors");
const systemRoutes = require("./routes/system"); // Required system routes
require("./services/backupService");
require("./services/reportScheduler");
const { iniciarMantenimiento } = require("./services/maintenanceService");

iniciarMantenimiento(); // Start auto-maintenance CRON

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = init(server);

io.on("connection", (socket) => {
    console.log("⚡ Nuevo cliente conectado:", socket.id);
    
    socket.on("disconnect", () => {
        console.log("🔥 Cliente desconectado");
    });
});

// Database Connection
connectDB();

// Middlewares de seguridad y optimización
app.use(helmet());
// Global Rate Limiting
const limiter = require("./middleware/rateLimiter");
app.use(limiter); // Aplica a todas las rutas
app.use(xss());
app.use(mongoSanitize());
app.use(compression()); // Comprime las respuestas HTTP

// Application logging
app.use(requestLogger);

// Middlewares estándar
app.use(cors());
app.use(bodyParser.json());

// Security sanitization
app.use((req, res, next) => {
    req.body = mongoSanitize(req.body);
    next();
});

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/fields", fieldsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/mercado-pago", require("./routes/mercadoPago")); // Added mercadoPago route
app.use("/api/stats", statsRoutes);
app.use("/api/negocios", negociosRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/backups", backupRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/errors", errorRoutes); 
app.use("/api/system", systemRoutes); // Mounted systemRoutes

// Health Check
app.get("/", (req, res) => {
    res.json({ status: "API Online", message: "Sistema de Reservas Activo" }); // Modified health check response
});

// Start scheduled jobs
require("./services/reportScheduler"); // Moved from top
require("./services/backupService"); // Moved from top

// Global Error Handler MUST be the last middleware
const errorHandler = require("./middleware/errorHandler"); // Required errorHandler
app.use(errorHandler); // Mounted errorHandler

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
});
