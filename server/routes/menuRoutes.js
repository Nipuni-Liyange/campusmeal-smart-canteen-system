const express = require("express");

const {
  createMenuItem,
  getAllMenuItems,
  getTodayMenu,
  deleteMenuItem,
} = require("../controllers/menuController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Student route
router.get("/today", protect, getTodayMenu);

// Admin routes
router.post("/", protect, adminOnly, createMenuItem);
router.get("/", protect, adminOnly, getAllMenuItems);
router.delete("/:id", protect, adminOnly, deleteMenuItem);

module.exports = router;