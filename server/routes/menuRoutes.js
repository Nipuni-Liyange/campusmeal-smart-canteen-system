const express = require("express");

const {
  createMenuItem,
  getAllMenuItems,
  getTodayMenuItems,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Student/public route - view today's available menu
router.get("/today", getTodayMenuItems);

// Admin routes
router.post("/", protect, adminOnly, createMenuItem);
router.get("/", protect, adminOnly, getAllMenuItems);
router.put("/:id", protect, adminOnly, updateMenuItem);
router.delete("/:id", protect, adminOnly, deleteMenuItem);

module.exports = router;