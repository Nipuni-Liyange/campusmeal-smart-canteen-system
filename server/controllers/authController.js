const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register user: student or admin
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, regNo, adminCode } = req.body;

    const selectedRole = role || "student";

    // Check common required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // Check valid role
    if (selectedRole !== "student" && selectedRole !== "admin") {
      return res.status(400).json({
        message: "Invalid user role",
      });
    }

    // Student must have registration number
    if (selectedRole === "student" && !regNo) {
      return res.status(400).json({
        message: "Registration number is required for students",
      });
    }

    // Admin must have secret code
    if (selectedRole === "admin") {
      if (!adminCode) {
        return res.status(400).json({
          message: "Admin secret is required",
        });
      }

      if (adminCode !== process.env.ADMIN_REGISTER_CODE) {
        return res.status(403).json({
          message: "Invalid admin code",
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
  return res.status(400).json({
    message: "You have already registered",
  });
}

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: selectedRole,
    };

    // Only students need regNo
    if (selectedRole === "student") {
      userData.regNo = regNo;
    }

    const user = await User.create(userData);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        regNo: user.regNo,
        role: user.role,
      },
      token: generateToken(user._id),
    });
} catch (error) {
  if (error.code === 11000) {
    return res.status(400).json({
      message: "You have already registered",
    });
  }

  res.status(500).json({
    message: "Server error during registration",
    error: error.message,
  });
}  
};

// Login user: student or admin
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const selectedRole = role || "student";

    // Check empty fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    // Check valid role
    if (selectedRole !== "student" && selectedRole !== "admin") {
      return res.status(400).json({
        message: "Invalid user role",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check selected login role with actual user role
    if (user.role !== selectedRole) {
      return res.status(403).json({
        message: `This account is not registered as ${selectedRole}`,
      });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        regNo: user.regNo,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};

// Get logged-in user profile
const getProfile = async (req, res) => {
  res.status(200).json({
    message: "Profile fetched successfully",
    user: req.user,
  });
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};