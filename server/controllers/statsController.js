const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Sale = require("../models/Sale");

/**
 * Controller to aggregate business statistics.
 * Provides totals for reservations, orders, and revenue.
 */
exports.getStats = async (req, res) => {
    try {
        const negocioId = req.negocioId;

        // Count totals
        const reservas = await Reservation.countDocuments({ negocioId });
        const pedidos = await Order.countDocuments({ negocioId });
        const productos = await Product.countDocuments({ negocioId });

        // Calculate total revenue from Sales
        const ventas = await Sale.aggregate([
            { $match: { negocioId: new mongoose.Types.ObjectId(negocioId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$total" }
                }
            }
        ]);

        const totalVentas = ventas[0]?.total || 0;

        res.json({
            reservas,
            pedidos,
            productos,
            totalVentas,
            activeUsers: 1, // Placeholder
            growth: "+12%" // Placeholder
        });
    } catch (error) {
        res.status(500).json({ message: "Error al generar estadísticas", error: error.message });
    }
};
