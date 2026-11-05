const express = require("express");
const protect = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

// Any authenticated user
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

// Admin only
router.get(
  "/admin-test",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      message: "Welcome Admin! You have access to this route.",
      user: req.user,
    });
  }
);

module.exports = router;