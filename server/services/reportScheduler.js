const cron = require("node-cron");
const sendDailyReport = require("./reportService");
const Negocio = require("../models/Negocio");

/**
 * Automates the distribution of daily reports to all active businesses 
 * that have an email configured.
 * 
 * Schedule: Every day at 06:00 AM
 */
cron.schedule("0 6 * * *", async () => {
    console.log("[Scheduler] Iniciando envío de reportes diarios...");
    try {
        const negocios = await Negocio.find({ activo: true });
        
        let count = 0;
        for (const negocio of negocios) {
            if (negocio.email) {
                await sendDailyReport(negocio);
                count++;
            }
        }
        console.log(`[Scheduler] Reportes diarios enviados exitosamente (${count} negocios).`);
    } catch (error) {
        console.error("[Scheduler] Error crítico automatizando reportes:", error);
    }
});
