const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

// SSL Configuration
const sslOptions = {
  key: fs.readFileSync("./key.pem"),
  cert: fs.readFileSync("./cert.pem"),
  rejectUnauthorized: false // For development only (remove in production)
};

const app = express();
const server = https.createServer(sslOptions, app);

// Enhanced CORS Configuration
const corsOptions = {
  origin: [
    "https://192.168.212.51:3000",
    "https://localhost:3000",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/getDoctor", require("./routes/getDoctors"));
app.use("/api/consultations", require("./routes/consultations"));

app.get("/", (req, res) => {
  res.send("✅ HTTPS Server is up and running!");
});

// Socket.IO Server with enhanced configuration
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

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
        offer 
      });
    } else {
      console.error(`Target user ${userId} not found`);
      socket.emit("call-error", { 
        message: "User not available" 
      });
    }
  });

  socket.on("call-accepted", ({ userId, ans }) => {
    const targetSocketId = emailToSocketMap.get(userId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("call-accepted", { ans });
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
server.on("error", (error) => {
  console.error("Server error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 HTTPS Server running at https://localhost:${PORT}`);
});