import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './lib/db.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js'; // ✅ Correct path
import messagesRoutes from './routes/message.route.js';
import {app,server} from './lib/socket.js';
dotenv.config();

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Debug logs
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // ✅ Include it
app.use("/api/messages", messagesRoutes);

// Server
const port = process.env.PORT || 5001;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB();
});
