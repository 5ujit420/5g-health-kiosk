const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const heightRoutes = require("./routes/heightRoutes");
const tempRoutes = require("./routes/tempRoutes");

// SSL Configuration
const sslOptions = {
  key: fs.readFileSync("./key.pem"),
  cert: fs.readFileSync("./cert.pem"),
  rejectUnauthorized: false, // For development only (remove in production)
};

const app = express();
// const server = https.createServer(sslOptions, app);

// Enhanced CORS Configuration
const corsOptions = {
  origin: [
    "https://192.168.37.51:3000",
    "https://192.168.212.51:3000",
    "https://192.168.254.51:3000",
    "https://10.42.0.23:3000",
    "https://192.168.254.176:3000",
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/getDoctor", require("./routes/getDoctors"));
app.use("/api/consultations", require("./routes/consultations"));
app.use("/api/report", require("./routes/healthreportroute"));
app.use("/api/height", heightRoutes);
app.use("/api/temp", tempRoutes);
// app.use('/api/sendReport', require("./report/send_health_report"));

app.get("/", (req, res) => {
  res.send("✅ HTTPS Server is up and running!");
});

// Socket.IO Server with enhanced configuration
// const io = new Server(server, {
//   cors: corsOptions,
//   transports: ['websocket', 'polling'],
//   allowEIO3: true,
//   pingTimeout: 60000,
//   pingInterval: 25000
// });

const io = new Server({ cors: true });

// Socket mappings
const emailToSocketMap = new Map();
const socketToEmailMap = new Map();

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  console.log("🔌 New socket connected:", socket.id);

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("join-room", ({ roomId, userId }) => {
    console.log(`👤 ${userId} joined room ${roomId}`);
    emailToSocketMap.set(userId, socket.id);
    socketToEmailMap.set(socket.id, userId);
    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-joined", { userId });
  });

  socket.on("call-user", ({ userId, offer }) => {
    const fromEmail = socketToEmailMap.get(socket.id);
    const targetSocketId = emailToSocketMap.get(userId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("incoming-call", {
        from: fromEmail,
        offer,
      });
    } else {
      console.error(`Target user ${userId} not found`);
      socket.emit("call-error", {
        message: "User not available",
      });
    }
  });

  socket.on("call-accepted", ({ userId, ans }) => {
    const targetSocketId = emailToSocketMap.get(userId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("call-accepted", { ans });
    } else {
      console.error(`Target user ${userId} not found for call-accepted`);
    }
  });

  // Handle end-call event
  socket.on("end-call", ({ to }) => {
    const targetSocketId = emailToSocketMap.get(to);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("call-ended");
      console.log(`📴 Call ended: Notified ${to}`);
    } else {
      console.error(`Target user ${to} not found for end-call`);
    }
  });

  socket.on("ice-candidate", ({ userId, candidate }) => {
    const targetSocketId = emailToSocketMap.get(userId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("ice-candidate", { candidate });
    } else {
      console.error(`Target user ${userId} not found for ICE candidate`);
    }
  });

  socket.on("disconnect", () => {
    const userEmail = socketToEmailMap.get(socket.id);
    if (userEmail) {
      emailToSocketMap.delete(userEmail);
      socketToEmailMap.delete(socket.id);
      console.log(`❌ ${userEmail} disconnected`);
    }
  });
});

// Server Error Handling
// server.on("error", (error) => {
//   console.error("Server error:", error);
// });

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

// Start Server
const PORT = process.env.PORT || 5000;
// server.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 HTTPS Server running at https://localhost:${PORT}`);
// });

app.listen(PORT, () => {
  console.log("server listening on port 5000");
});
