const sendEmail = require("./emailService");
const Sale = require("../models/Sale");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");

/**
 * Generates and sends a daily business summary email.
 * 
 * @param {Object} negocio - The Negocio document.
 */
async function sendDailyReport(negocio) {
    try {
        if (!negocio.email || negocio.email.trim() === "") {
            console.log(`[Report Service] Skipping ${negocio.nombre} - no email configured.`);
            return;
        }

        const objectId = negocio._id;
        
        // Calculate date range for "yesterday"
        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date();
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);

        // 1. Total Sales from yesterday
        const ventasRes = await Sale.aggregate([
            { 
                $match: { 
                    negocioId: objectId,
                    fecha: { $gte: yesterdayStart, $lte: yesterdayEnd }
                } 
            },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const ventasAyer = ventasRes[0]?.total || 0;

        // 2. Reservations from yesterday
        const reservasAyer = await Reservation.countDocuments({
            negocioId: objectId,
            date: { $gte: yesterdayStart, $lte: yesterdayEnd }
        });

        // 3. Top Products from yesterday
        const productoResult = await Order.aggregate([
            { 
                $match: { 
                    negocioId: objectId,
                    createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
                    estado: { $in: ["listo", "entregado"] }
                } 
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productoId",
                    nombre: { $first: "$items.nombre" },
                    cantidad: { $sum: "$items.cantidad" }
                }
            },
            { $sort: { cantidad: -1 } },
            { $limit: 1 }
        ]);
        
        const topProducto = productoResult.length > 0 
            ? `${productoResult[0].nombre} (${productoResult[0].cantidad} u.)` 
            : "No hubo ventas registradas";

        // Generate HTML
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #D4AF37; text-align: center;">Resumen Diario - ${negocio.nombre}</h1>
                <p style="color: #666; text-align: center;">Resultados del ${yesterdayStart.toLocaleDateString()}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 15px; border-bottom: 1px solid #eee;">
                            <strong style="color: #333;">Ventas del día:</strong>
                        </td>
                        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; color: #10b981; font-weight: bold; font-size: 18px;">
                            $${ventasAyer.toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 15px; border-bottom: 1px solid #eee;">
                            <strong style="color: #333;">Reservas de canchas:</strong>
                        </td>
                        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
                            ${reservasAyer}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 15px; border-bottom: 1px solid #eee;">
                            <strong style="color: #333;">Producto más vendido:</strong>
                        </td>
                        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
                            ${topProducto}
                        </td>
                    </tr>
                </table>

                <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
                    <p>Este es un reporte automático del Sistema SAAS Complejo Giovanni.</p>
                </div>
            </div>
        `;

        await sendEmail(negocio.email, `Reporte Diario - ${negocio.nombre}`, html);
        console.log(`[Report Service] Daily report sent to ${negocio.email}`);
    } catch (error) {
        console.error(`[Report Service] Error generating report for ${negocio.nombre}:`, error);
    }
}

module.exports = sendDailyReport;
