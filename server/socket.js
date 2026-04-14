let io;

/**
 * Socket.IO Singleton Utility
 * Initializes the socket server and provides access to the io instance.
 */
function init(server) {
    const { Server } = require("socket.io");
    
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust for production security
            methods: ["GET", "POST"]
        }
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = { init, getIO };
