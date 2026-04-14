const nodemailer = require("nodemailer");

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER || "tucorreo@gmail.com",
        pass: process.env.EMAIL_PASS || "clave_app_secreta"
    }
});

/**
 * Sends an HTML email.
 * 
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject line.
 * @param {string} html - HTML formatted body of the email.
 */
async function sendEmail(to, subject, html) {
    if (!to || to.trim() === "") {
        console.warn(`[Email Service] Cannot send email, recipient address is missing.`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Complejo Giovanni ERP" <${process.env.EMAIL_USER || "noreply@complejo"}>`,
            to,
            subject,
            html
        });
        console.log(`[Email Service] Correo enviado a ${to}: ${info.messageId}`);
    } catch (error) {
        console.error(`[Email Service] Error al enviar correo a ${to}:`, error);
    }
}

module.exports = sendEmail;
