const { MercadoPagoConfig, Preference } = require("mercadopago");

/**
 * MercadoPago Configuration (SDK v2)
 */
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || "TEST_TOKEN"
});

module.exports = { client, Preference };
