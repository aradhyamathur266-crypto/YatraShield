const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
  try{
    const token = socket.handshake.auth?.token;

    if(!token || typeof token !== "string") {
      return next(new Error("Authentication required"));
    }

    if(!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return next(new Error("Authentication service unavailable"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.user_id !== "string" ||
      !decoded.user_id ||
      typeof decoded.role !== "string" ||
      !["tourist", "responder", "supervisor", "admin"].includes(decoded.role)
    ) {
      return next(new Error("Invalid authentication token"));
    }

    socket.user = {
      user_id: decoded.user_id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
};

module.exports = socketAuth;
