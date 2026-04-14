const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const logger = require("./logger");

/**
 * Searches the 'logs' directory and deletes files older than 7 days.
 */
function limpiarLogs() {
    try {
        const logsDir = path.join(__dirname, "../logs");

        // Check if logs directory exists before reading
        if (!fs.existsSync(logsDir)) {
            return;
        }

        fs.readdir(logsDir, (err, files) => {
            if (err) {
                logger.error("[Mantenimiento] Error leyendo directorio de logs:", err);
                return;
            }

            files.forEach(file => {
                const filePath = path.join(logsDir, file);

                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        logger.error(`[Mantenimiento] Error al leer status del archivo ${file}:`, err);
                        return;
                    }

                    const ahora = Date.now();
                    const edad = ahora - stats.mtimeMs;
                    const sieteDias = 7 * 24 * 60 * 60 * 1000;

                    if (edad > sieteDias) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                logger.error(`[Mantenimiento] Error eliminando log viejo ${file}:`, err);
                            } else {
                                logger.info(`[Mantenimiento] Log antiguo eliminado automáticamente: ${file}`);
                            }
                        });
                    }
                });
            });
        });
    } catch (error) {
        logger.error("[Mantenimiento] Error fatal en la rutina de limpieza de logs:", error);
    }
}

/**
 * Empty placeholder for future temporal data cleanup (e.g., dropping old sessions)
 */
function limpiarTemporales() {
    logger.info("[Mantenimiento] Limpiando archivos temporales...");
    // Add logic here to clear temp PDF files, expired sessions, etc.
}

/**
 * Registers the background cron jobs.
 */
function iniciarMantenimiento() {
    // Runs every day at 04:00 AM server time
    cron.schedule("0 4 * * *", () => {
        logger.info("[Mantenimiento] Iniciando rutina de mantenimiento programada (04:00 AM)...");
        limpiarLogs();
        limpiarTemporales();
    });
    
    logger.info("[Mantenimiento] Servicio de auto-mantenimiento activado.");
}

module.exports = {
    iniciarMantenimiento,
    limpiarLogs,
    limpiarTemporales
};
