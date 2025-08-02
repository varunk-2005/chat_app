import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Store socketId for each userId
const userSocketMap = {}; // { userId123: socketId456 }

// Helper to get socketId by userId (for private messaging, etc.)
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Initialize Socket.IO server with CORS config
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // Adjust to your frontend URL(s)
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  // Get userId from handshake query params
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id; // Map userId to socket.id
    socket.userId = userId; // Attach userId to socket object
  }

  // Notify all clients of current online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);

    if (socket.userId) {
      delete userSocketMap[socket.userId]; // Remove user from map
      io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Update clients
    }
  });
});

export { io, app, server };
