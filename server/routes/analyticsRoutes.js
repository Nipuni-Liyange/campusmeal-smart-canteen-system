const express = require("express");

const { getTodayAnalytics } = require("../controllers/analyticsController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin only - today's analytics
router.get("/today", protect, adminOnly, getTodayAnalytics);

module.exports = router;