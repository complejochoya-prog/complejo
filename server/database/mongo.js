const mongoose = require("mongoose");

/**
 * Establishes a connection to the MongoDB database.
 */
async function connectDB() {
    try {
        const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/complejo_giovanni";
        const conn = await mongoose.connect(mongoUrl);
        console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[MongoDB] Connection Warning: ${error.message}`);
    }
}

module.exports = connectDB;
