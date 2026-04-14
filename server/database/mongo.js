const mongoose = require("mongoose");

/**
 * Establishes a connection to the MongoDB database.
 */
async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[MongoDB] Connection Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;
