const os = require("os");

/**
 * Controller to fetch live system metrics.
 */
exports.getSystemStatus = (req, res) => {
    try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        
        const status = {
            uptime: Math.floor(process.uptime()), // Uptime in seconds
            memoria: {
                total: totalMem,
                libre: freeMem,
                enUso: totalMem - freeMem,
                porcentajeUso: (((totalMem - freeMem) / totalMem) * 100).toFixed(2)
            },
            cpu: os.loadavg(), // Array containing 1, 5, and 15 minute load averages
            plataforma: os.platform(),
            arquitectura: os.arch(),
            nodeVersion: process.version,
            fecha: new Date()
        };

        res.json(status);
    } catch (error) {
        console.error("[System Status] Error obteniendo métricas:", error);
        res.status(500).json({ error: "Error obteniendo el estado del sistema" });
    }
};
