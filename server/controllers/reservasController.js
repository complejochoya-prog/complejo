const Reservation = require("../models/Reservation");
const { client, Preference } = require("../services/mercadoPago");
const { getIO } = require("../socket");
const logAction = require("../services/auditService");


/**
 * Controller to manage court reservations and payments.
 */

/**
 * Generates a MercadoPago payment preference for a reservation.
 */
exports.crearPagoReserva = async (req, res) => {
    try {
        const { cancha, fecha, hora, cliente } = req.body;

        // In a real production app, fetch the price from the 'Field' model
        // Using a fixed deposit (seña) for this demo
        const preferenceData = {
            items: [
                {
                    title: `Reserva Cancha: ${cancha} (${fecha} ${hora})`,
                    quantity: 1,
                    currency_id: "ARS",
                    unit_price: 2000 // Fixed reservation fee
                }
            ],
            back_urls: {
                success: "http://localhost:5174/pago-exitoso",
                failure: "http://localhost:5174/pago-error",
                pending: "http://localhost:5174/pago-pendiente"
            },
            auto_return: "approved",
            // Reference to link the payment with the reservation data
            external_reference: JSON.stringify({ cancha, fecha, hora, cliente, negocioId: req.negocioId })
        };

        const preference = new Preference(client);
        const response = await preference.create({ body: preferenceData });
        
        res.json({
            init_point: response.init_point
        });
    } catch (error) {
        console.error("[MercadoPago] Error creating preference:", error);
        res.status(500).json({ message: "Error al generar link de pago", error: error.message });
    }
};

/**
 * Retrieves all reservations for the authenticated user's business.
 */
exports.getReservas = async (req, res) => {
    try {
        const reservas = await Reservation.find({
            negocioId: req.negocioId
        });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener reservas", error: error.message });
    }
};

/**
 * Creates a new reservation linked to the business.
 */
exports.crearReserva = async (req, res) => {
    try {
        const reserva = new Reservation({
            ...req.body,
            negocioId: req.negocioId
        });

        await reserva.save();
        
        // Emit real-time notification
        getIO().emit("nueva_reserva", reserva);

        await logAction({
            usuario: req.user.email || req.user.id,
            accion: "nueva reserva",
            modulo: "reservas",
            negocioId: req.negocioId,
            detalle: `Nueva reserva en cancha ${reserva.cancha} - ${reserva.fecha} ${reserva.hora}`
        });

        res.status(201).json(reserva);
    } catch (error) {
        res.status(400).json({ message: "Error al crear la reserva", error: error.message });
    }
};
