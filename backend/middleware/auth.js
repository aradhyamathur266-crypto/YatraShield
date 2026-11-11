const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try{
    const authHeader = req.headers.authorization;

    if(!authHeader){
      return res.status(401).json({
        message: "Authorization token is required",
      });
    }

    if(!authHeader.startsWith("Bearer ")){
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    const token = authHeader.slice(7).trim();

    if(!token || token.includes(" ")){
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    if(!process.env.JWT_SECRET){
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "Authentication service is not configured",
      });
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
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
    };

    next();
  }catch(error){
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = protect;
