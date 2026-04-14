const Order = require("../models/Order");
const Product = require("../models/Product");
const { getIO } = require("../socket");

/**
 * Controller for managing bar orders.
 */

/**
 * Retrieves all orders for the current business.
 */
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ negocioId: req.negocioId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener pedidos", error: error.message });
    }
};

/**
 * Creates a new order and decrements product stock.
 */
exports.createOrder = async (req, res) => {
    try {
        const order = new Order({
            ...req.body,
            negocioId: req.negocioId
        });

        // Decrement stock for each item in the order
        if (req.body.items && Array.isArray(req.body.items)) {
            for (const item of req.body.items) {
                // Assuming item is the product name for now
                await Product.updateOne(
                    { name: item, negocioId: req.negocioId },
                    { $inc: { stock: -1 } }
                );
            }
        }

        await order.save();
        
        // Emit real-time notification
        getIO().emit("nuevo_pedido", order);

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: "Error al crear pedido", error: error.message });
    }
};

/**
 * Updates an order status or details.
 */
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findOneAndUpdate(
            { _id: id, negocioId: req.negocioId },
            req.body,
            { new: true }
        );
        if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar pedido", error: error.message });
    }
};
