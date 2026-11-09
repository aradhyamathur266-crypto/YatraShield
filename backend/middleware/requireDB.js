const mongoose = require("mongoose");

/**
 * Guard for DB-backed routes. When Mongo isn't connected (no-DB dev mode),
 * returns a clear 503 instead of hanging/buffering or crashing.
 * Health check (`GET /`, `GET /api/health`) must NOT use this middleware.
 */
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database not connected. MongoDB setup is required for this feature (see backend/.env MONGO_URI). The app server itself is running.",
      code: "DB_NOT_CONNECTED",
    });
  }
  next();
};

module.exports = requireDB;
