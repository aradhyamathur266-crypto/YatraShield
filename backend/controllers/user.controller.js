
const User = require("../models/user");

// Get logged-in user's profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id)
      .select("-password");

    if(!user){
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  }catch (error){
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

// List responder accounts (for supervisor/admin assignment dropdowns)
const listResponders = async (req, res) => {
  try {
    const responders = await User.find({ role: "responder" })
      .select("name email _id createdAt")
      .sort({ name: 1 });

    return res.status(200).json({
      message: "Responders fetched successfully",
      count: responders.length,
      responders,
    });
  } catch (error) {
    console.error("List responders error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch responders",
    });
  }
};

module.exports = {getProfile, listResponders};
