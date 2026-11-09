const mongoose = require("mongoose");

// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

function getDBState() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] || "unknown";
}

/**
 * Connect to MongoDB if MONGO_URI is configured.
 * Never exits the process — when Mongo isn't set up yet (dev without DB),
 * the API starts in "no-DB mode" and DB-backed routes return 503.
 * @returns {Promise<boolean>} true if connected
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI?.trim();

  if (!uri) {
    console.warn("⚠️  MONGO_URI not set — starting in NO-DB mode (API will return 503 until MongoDB is configured).");
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    console.warn("⚠️  MongoDB connection failed — starting in NO-DB mode:", error.message);
    console.warn("   Set MONGO_URI in backend/.env (see .env.example). API routes will return 503 until then.");
    return false;
  }
};

module.exports = connectDB;
module.exports.isDBConnected = isDBConnected;
module.exports.getDBState = getDBState;
