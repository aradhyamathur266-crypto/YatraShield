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
const {generalLimiter,loginLimiter,registerLimiter,incidentCreationLimiter} = require("./middleware/rateLimiter");

const app = express();
const server = http.createServer(app);

// FRONTEND_URL supports one or multiple comma-separated origins.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin, callback) => {
  if(!origin || allowedOrigins.includes(origin)){
    return callback(null, true);
  }

  // Allow localhost development origins.
  if(/^http:\/\/localhost:\d+$/.test(origin)){
    return callback(null, true);
  }

  return callback(new Error("Not allowed by CORS"));
};

// Socket.IO configuration.
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

// Make Socket.IO available to controllers.
app.set("io", io);

// Health checks are intentionally outside general API rate limiting.
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
    mode: isDBConnected()
      ? "full"
      : "no-db (MongoDB not configured/running)",
  });
});

// General API rate limiting.
app.use("/api", generalLimiter);

// Authentication routes with dedicated limits.
// These route-level limiters run in addition to the general limiter.
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", registerLimiter);

// Database-dependent routes.
app.use("/api/auth", requireDB, authRoutes);
app.use("/api/user", requireDB, userRoutes);

// Stricter rate limiting for incident creation.
// Other incident routes retain the general API limit.
app.use(
  "/api/incidents",
  (req, res, next) => {
    if (req.method === "POST" && req.path === "/") {
      return incidentCreationLimiter(req, res, next);
    }

    next();
  },
  requireDB,
  incidentRoutes
);

// Socket.IO authentication.
io.use(socketAuth);

io.on("connection", (socket) => {
  const userId = socket.user.user_id;
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

let escalationCheckInProgress = false;
let escalationTimer = null;

// Prevent overlapping escalation checks.
const runEscalationCheck = async () => {
  if(!isDBConnected()){
    return;
  }

  if(escalationCheckInProgress){
    console.log("Previous escalation check still running. Skipping.");
    return;
  }

  escalationCheckInProgress = true;

  try{
    const escalatedCount = await checkOverdueIncidents(io);

    if (escalatedCount > 0) {
      console.log(`${escalatedCount} overdue incident(s) escalated`);
    }
  }catch(error){
    console.error("Escalation scheduler error:", error.message);
  }finally{
    escalationCheckInProgress = false;
  }
};

// Start server.
const startServer = async () => {
  const dbConnected = await connectDB();

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    console.log(
      dbConnected
        ? "Mode: full (MongoDB connected)"
        : "Mode: NO-DB (MongoDB not connected)"
    );

    // Scheduler continues checking even after initial DB disconnection.
    runEscalationCheck();

    escalationTimer = setInterval(
      runEscalationCheck,
      ESCALATION_CHECK_INTERVAL
    );

    console.log(
      "Automatic escalation service started (30-second interval)"
    );

    console.log("API rate limiting enabled.");
  });
};

// Graceful shutdown.
const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down YatraShield...`);

  if (escalationTimer) {
    clearInterval(escalationTimer);
    escalationTimer = null;
  }

  io.close(() => {
    console.log("Socket.IO connections closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
