const admin = require("firebase-admin");

// Initialize using Application Default Credentials.
// Note: This requires the GOOGLE_APPLICATION_CREDENTIALS environment variable
// to be set in production, pointing to the service account JSON file.
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
    console.log("[Firebase Admin] Initialized successfully");
} catch (error) {
    if (!/already exists/.test(error.message)) {
        console.error("[Firebase Admin] Initialization error:", error.stack);
    }
}

/**
 * Sends a push notification to a specific device.
 * 
 * @param {string} token - The FCM device token.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 */
async function sendNotification(token, title, body) {
    if (!token) {
        console.warn("[Firebase Admin] Cannot send notification: No token provided");
        return;
    }

    try {
        const response = await admin.messaging().send({
            token,
            notification: {
                title,
                body
            }
        });
        console.log(`[Firebase Admin] Successfully sent message:`, response);
    } catch (error) {
        console.error(`[Firebase Admin] Error sending message to token ${token}:`, error);
    }
}

module.exports = sendNotification;
