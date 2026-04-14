const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Order = require("../models/Order");

/**
 * Generates aggregated business analytics data.
 */
exports.getReportsData = async (req, res) => {
    try {
        const negocioId = req.negocioId;
        const objectId = new mongoose.Types.ObjectId(negocioId);

        // 1. Sales Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const ventasBrutas = await Sale.aggregate([
            { 
                $match: { 
                    negocioId: objectId,
                    fecha: { $gte: sevenDaysAgo }
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } },
                    total: { $sum: "$total" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Map to standard format for Recharts (e.g. { date: 'Lun', ventas: 150 })
        const mapDay = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const ventasTrend = ventasBrutas.map(v => {
            const d = new Date(v._id + "T00:00:00"); // Avoid timezone shift
            return {
                date: mapDay[d.getDay()],
                ventas: v.total
            };
        });

        // 2. Top Products Sold
        const productAggr = await Order.aggregate([
            { $match: { negocioId: objectId } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productoId",
                    nombre: { $first: "$items.nombre" },
                    cantidadVendida: { $sum: "$items.cantidad" }
                }
            },
            { $sort: { cantidadVendida: -1 } },
            { $limit: 5 } // Top 5
        ]);

        const productosTop = productAggr.map(p => ({
            producto: p.nombre || "Desconocido",
            cantidad: p.cantidadVendida
        }));

        // 3. Global Summary
        const totalVentasRes = await Sale.aggregate([
            { $match: { negocioId: objectId } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const totalPedidos = await Order.countDocuments({ negocioId: objectId });
        
        const productosVendidosTotal = productAggr.reduce((acc, curr) => acc + curr.cantidadVendida, 0);

        res.json({
            ventas: ventasTrend,
            productosTop: productosTop,
            resumen: {
                totalVentas: totalVentasRes[0]?.total || 0,
                totalPedidos: totalPedidos,
                productosVendidos: productosVendidosTotal
            }
        });

    } catch (error) {
        console.error("Error generating reports:", error);
        res.status(500).json({ message: "Error al generar reportes", error: error.message });
    }
};
