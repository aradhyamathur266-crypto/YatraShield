const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if(!secret){
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      user_id: user._id,
      role: user.role,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

// Public registration: all new accounts are tourists.
const registerUser = async (req, res) => {
  try{
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if(!normalizedName || normalizedName.length > 100){
      return res.status(400).json({
        message: "Name must be between 1 and 100 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(normalizedEmail) || normalizedEmail.length > 254){
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    if(
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and at most 72 bytes",
      });
    }

    if(!process.env.JWT_SECRET){
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "Authentication service is not configured",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if(existingUser){
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "tourist",
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch(error){
    console.error("Registration error:", error.message);

    if(error.code === 11000){
      return res.status(409).json({
        message: "User already exists",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try{
    const { email, password } = req.body;

    if(
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if(!process.env.JWT_SECRET){
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "Authentication service is not configured",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if(!user){
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if(!isPasswordCorrect){
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch(error){
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
