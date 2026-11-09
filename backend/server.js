const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const { isDBConnected, getDBState } = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const incidentRoutes = require("./routes/incident.routes");
const socketAuth = require("./middleware/socketAuth");
const requireDB = require("./middleware/requireDB");
const checkOverdueIncidents = require("./services/escalationService");

const app = express();
const server = http.createServer(app);

// FRONTEND_URL may be a single URL or a comma-separated list.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  // Allow any localhost dev origin (e.g. preview ports) in development.
  if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
  return callback(new Error("Not allowed by CORS"));
};

const io = new Server(server, {
  cors: {
    origin: isAllowedOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

app.use(cors({
  origin: isAllowedOrigin,
}));

app.use(express.json());

// Make Socket.IO available to controllers through req.app.get("io")
app.set("io", io);

// Health check — always available, even without MongoDB.
app.get("/", (req, res) => {
  res.json({
    message: "YatraShield Backend is running successfully",
    db: getDBState(),
    dbConnected: isDBConnected(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: isDBConnected() ? "ok" : "running_no_db",
    db: getDBState(),
    dbConnected: isDBConnected(),
    mode: isDBConnected() ? "full" : "no-db (MongoDB not configured/running)",
  });
});

// All routes below need MongoDB. In no-DB mode they return 503.
app.use("/api/auth", requireDB, authRoutes);
app.use("/api/user", requireDB, userRoutes);
app.use("/api/incidents", requireDB, incidentRoutes);

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

const ESCALATION_CHECK_INTERVAL = 30 * 1000;

const startServer = async () => {
  // Always start the HTTP server, even if MongoDB isn't available yet.
  // DB-backed routes return 503 until MongoDB is configured (see requireDB).
  const dbConnected = await connectDB();

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(
      dbConnected
        ? "Mode: full (MongoDB connected)"
        : "Mode: NO-DB (MongoDB not connected — UI will load, API login/incidents return 503)"
    );

    if (dbConnected) {
      // Run the escalation checker every 30 seconds
      checkOverdueIncidents(io);

      setInterval(() => {
        checkOverdueIncidents(io);
      }, ESCALATION_CHECK_INTERVAL);

      console.log("Automatic escalation service started");
    }
  });
};

startServer();
