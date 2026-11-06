
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

module.exports = {getProfile};
