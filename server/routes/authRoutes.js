const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register student
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Get logged-in user profile
router.get("/profile", protect, getProfile);

module.exports = router;