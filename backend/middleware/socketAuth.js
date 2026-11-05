
const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.user_id || !decoded.role) {
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
