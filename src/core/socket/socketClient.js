import { io } from "socket.io-client";

/**
 * Socket.IO Client instance.
 * Connects to the backend real-time server.
 */
const socket = io("http://localhost:4000");

// Debugging
socket.on("connect", () => {
    console.log("CONNECTED TO SOCKET SERVER:", socket.id);
});

export default socket;
