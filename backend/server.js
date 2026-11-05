const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const incidentRoutes = require("./routes/incident.routes");
const socketAuth = require("./middleware/socketAuth");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"],
  },
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));

app.use(express.json());

// Make Socket.IO available to controllers through req.app.get("io")
app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/incidents", incidentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "YatraShield Backend is running successfully",
  });
});

io.use(socketAuth);

io.on("connection", (socket) => {
  const userId = socket.user.user_id;

  // Join a private room derived from the verified JWT
  const userRoom = `user:${userId}`;
  socket.join(userRoom);

  console.log(
    `Authenticated user connected: ${userId} (${socket.user.role})`
  );
  console.log(`Joined private room: ${userRoom}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
  });
});

const PORT = process.env.PORT || 5000;

connectDB();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
